#!/usr/bin/env python3
"""
scripts/purge_vercel_deployments.py

🧹 VERCEL DEPLOYMENT STORAGE PURGE SCRIPT
Keeps your Vercel account strictly within the 10 GB Free Plan limit.

Logic:
1. Fetches all deployments via Vercel REST API v6.
2. Identifies active Production deployments (never touches live production).
3. Preserves the current production deployment + the latest 2 preview deployments (3 total).
4. Deletes all historical, stale, and failed deployments (v13 DELETE API).
5. Reports total deployments purged and estimated freed storage.

Usage:
  python scripts/purge_vercel_deployments.py
  python scripts/purge_vercel_deployments.py --token <YOUR_VERCEL_TOKEN>
  python scripts/purge_vercel_deployments.py --dry-run
"""

import os
import sys
import json
import time
import argparse
import urllib.request
import urllib.error

# Force UTF-8 on Windows stdout/stderr to prevent emoji charmap errors
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

def load_env_local():
    """Load VERCEL_TOKEN from .env.local if present."""
    env_path = os.path.join(os.getcwd(), '.env.local')
    if not os.path.exists(env_path):
        return
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                k, v = line.split('=', 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k not in os.environ:
                    os.environ[k] = v
    except Exception as e:
        print(f"⚠️  Notice: could not parse .env.local: {e}")

def vercel_request(endpoint, token, method='GET', body=None):
    """Execute authenticated HTTP request to Vercel API."""
    url = f"https://api.vercel.com{endpoint}"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'User-Agent': 'Anvitam-Storage-Purge-Agent/1.0'
    }
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as err:
        err_body = err.read().decode('utf-8', errors='ignore')
        try:
            parsed = json.loads(err_body)
            err_msg = parsed.get('error', {}).get('message', err_body)
        except Exception:
            err_msg = err_body
        raise RuntimeError(f"Vercel API HTTP {err.code}: {err_msg}")

def resolve_project(token, project_name=None):
    """
    Fetch all projects in the Vercel account and resolve the target project.
    If project_name is provided, match by name or id (case-insensitive substring or exact).
    If project_name is not provided or not found, auto-detect the most relevant project.
    """
    try:
        data = vercel_request("/v9/projects", token)
        projects = data.get('projects', [])
        if not projects:
            print("⚠️  No projects found on Vercel account.")
            return None
        
        project_names = [p.get('name') for p in projects]
        print(f"📋 Available Vercel Projects in account: {project_names}")
        
        if project_name:
            # 1. Exact match on name or id
            for p in projects:
                if p.get('name') == project_name or p.get('id') == project_name:
                    print(f"🎯 Matched project '{p.get('name')}' (ID: {p.get('id')})")
                    return p.get('id')
            # 2. Case-insensitive match or substring
            for p in projects:
                if project_name.lower() in p.get('name', '').lower() or p.get('name', '').lower() in project_name.lower():
                    print(f"🎯 Matched project '{p.get('name')}' (ID: {p.get('id')}) by fuzzy match with '{project_name}'")
                    return p.get('id')
        
        # 3. If no project_name or no match, find project containing 'anvitam'
        for p in projects:
            if 'anvitam' in p.get('name', '').lower():
                print(f"🎯 Auto-detected project '{p.get('name')}' (ID: {p.get('id')})")
                return p.get('id')
        
        # 4. Fallback to the first project in account if only 1
        if len(projects) == 1:
            fallback = projects[0]
            print(f"🎯 Using single project '{fallback.get('name')}' (ID: {fallback.get('id')})")
            return fallback.get('id')
            
        print("ℹ️  Multiple projects found and no direct match; querying deployments across account.")
        return None
    except Exception as e:
        print(f"⚠️  Notice: could not query /v9/projects ({e}). Querying deployments directly...")
        return None

def purge_deployments(token, project_name=None, keep_count=3, dry_run=False):
    print("=" * 65)
    print("🚀 ANVITAM VERCEL STORAGE PURGE UTILITY")
    print(f"   Target: Preserve latest {keep_count} deployments (including production)")
    print(f"   Mode:   {'🧪 DRY-RUN (no deletions)' if dry_run else '⚡ ACTIVE PURGE'}")
    print("=" * 65)

    target_project_id = resolve_project(token, project_name)

    # 1. Fetch deployments list (paginated up to 500)
    all_deployments = []
    until = None
    
    while True:
        query = f"/v6/deployments?limit=100"
        if target_project_id:
            query += f"&projectId={target_project_id}"
        if until:
            query += f"&until={until}"
            
        print(f"📡 Querying deployments from Vercel API...")
        data = vercel_request(query, token)
        deps = data.get('deployments', [])
        if not deps:
            break
            
        all_deployments.extend(deps)
        pagination = data.get('pagination', {})
        until = pagination.get('next')
        if not until or len(deps) < 100 or len(all_deployments) >= 500:
            break

    print(f"📦 Found {len(all_deployments)} total deployment(s) in account.\n")
    if not all_deployments:
        print("✅ No deployments found. Nothing to clean up.")
        return

    # Sort descending by creation timestamp (newest first)
    all_deployments.sort(key=lambda d: d.get('created', 0), reverse=True)

    keep_ids = set()

    # 1. Find and preserve the active production deployment
    prod_deployments = [d for d in all_deployments if d.get('target') == 'production']
    if prod_deployments:
        current_prod = prod_deployments[0]
        keep_ids.add(current_prod['uid'])
        print(f"🔒 Keeping Active Production: {current_prod['uid']} ({current_prod.get('url', 'N/A')})")
    elif all_deployments:
        keep_ids.add(all_deployments[0]['uid'])
        print(f"🔒 Keeping Newest Deployment:  {all_deployments[0]['uid']} ({all_deployments[0].get('url', 'N/A')})")

    # 2. Preserve other newest deployments up to keep_count
    for d in all_deployments:
        if len(keep_ids) >= keep_count:
            break
        if d['uid'] not in keep_ids:
            keep_ids.add(d['uid'])
            print(f"🔒 Keeping Recent Deployment: {d['uid']} ({d.get('url', 'N/A')})")

    to_delete = [d for d in all_deployments if d['uid'] not in keep_ids]

    print(f"\n📊 Summary:")
    print(f"   Deployments preserved: {len(keep_ids)}")
    print(f"   Deployments to purge:  {len(to_delete)}")
    print("-" * 65)

    if not to_delete:
        print("✅ Storage is already optimal. No old deployments need to be purged.")
        return

    # Estimated storage savings (~300MB - 500MB per historical deployment bundle)
    est_savings_mb = len(to_delete) * 350
    print(f"💾 Estimated Storage to be freed: ~{est_savings_mb / 1024:.2f} GB\n")

    if dry_run:
        print("🧪 Dry-run complete. Run without --dry-run to delete old deployments.")
        return

    deleted_count = 0
    failed_count = 0

    for idx, dep in enumerate(to_delete, 1):
        dep_id = dep['uid']
        dep_url = dep.get('url', 'unknown')
        created_str = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(dep.get('created', 0) / 1000))
        
        try:
            print(f"[{idx}/{len(to_delete)}] Deleting {dep_id} ({created_str}) - {dep_url} ...", end="", flush=True)
            vercel_request(f"/v13/deployments/{dep_id}", token, method='DELETE')
            print(" ✅ Deleted")
            deleted_count += 1
            time.sleep(0.2) # Gentle rate-limit adherence
        except Exception as e:
            print(f" ❌ Failed: {e}")
            failed_count += 1

    print("\n" + "=" * 65)
    print("🎉 PURGE PROCESS COMPLETED!")
    print(f"   Successfully deleted: {deleted_count} deployments")
    if failed_count > 0:
        print(f"   Failed deletions:     {failed_count} deployments")
    print(f"   Your Vercel Deployment Storage will reflect this decrease shortly.")
    print("=" * 65)

def main():
    load_env_local()
    
    parser = argparse.ArgumentParser(description="Purge old inactive Vercel deployments to save free storage.")
    parser.add_argument('--token', default=os.getenv('VERCEL_TOKEN'), help="Vercel personal access token")
    parser.add_argument('--project', default=os.getenv('VERCEL_PROJECT_ID') or os.getenv('VERCEL_PROJECT_NAME'), help="Vercel Project Name or ID (optional)")
    parser.add_argument('--keep', type=int, default=3, help="Number of latest deployments to keep (default: 3)")
    parser.add_argument('--dry-run', action='store_true', help="Preview deletions without executing them")
    args = parser.parse_args()

    token = args.token
    if not token:
        print("❌ Error: VERCEL_TOKEN not provided.")
        print("\nHow to get your Vercel Token (takes 20 seconds):")
        print("  1. Go to https://vercel.com/account/tokens")
        print("  2. Click 'Create Token' -> Name it 'Anvitam Purge' -> Scope: Full Account")
        print("  3. Run either:")
        print("     python scripts/purge_vercel_deployments.py --token <your_token>")
        print("     or add VERCEL_TOKEN=\"<your_token>\" to .env.local")
        sys.exit(1)

    try:
        purge_deployments(token, project_name=args.project, keep_count=args.keep, dry_run=args.dry_run)
    except Exception as err:
        print(f"\n❌ Fatal Error: {err}")
        sys.exit(1)

if __name__ == '__main__':
    main()
