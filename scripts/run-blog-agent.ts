/**
 * scripts/run-blog-agent.ts
 *
 * CLI / Cron Runner for the Autonomous AI Blog Agent.
 *
 * Usage:
 *   npx tsx scripts/run-blog-agent.ts
 *   npx tsx scripts/run-blog-agent.ts "Custom topic name here"
 *   npx tsx scripts/run-blog-agent.ts --dry-run
 */
import './load-env';
import blogAgentHandler from '../api/blog-agent';

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const customTopic = args.find(a => !a.startsWith('--'));

  console.log('🤖 Starting Autonomous AI Blog Agent (Zero-Cost Engine)...');
  if (customTopic) {
    console.log(`📌 Topic specified: "${customTopic}"`);
  } else {
    console.log('🎲 No topic specified: Agent will pick a high-impact strike-zone topic.');
  }

  if (isDryRun) {
    console.log('🧪 DRY-RUN MODE: Verifying API keys and environment configuration...');
    console.log('   NVIDIA NIM Key:', process.env.NVIDIA_API_KEY ? '✅ Configured' : '❌ Missing');
    console.log('   Gemini Key:    ', process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing');
    console.log('   HuggingFace:   ', process.env.HUGGINGFACE_API_KEY ? '✅ Configured' : '❌ Missing');
    console.log('   Cloudinary:    ', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Missing');
    console.log('   Resend Key:    ', process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing');
    console.log('   Firebase DB:   ', process.env.FIREBASE_PROJECT_ID ? '✅ Configured' : '❌ Missing');
    console.log('✨ Environment check complete.');
    process.exit(0);
  }

  const mockReq: any = {
    method: 'POST',
    url: '/api/blog-agent',
    query: { secret: process.env.ADMIN_INIT_SECRET },
    headers: { 'x-agent-secret': process.env.ADMIN_INIT_SECRET },
    body: {
      topic: customTopic,
      generateImage: true,
      notify: true,
    },
  };

  let statusCode = 200;
  let responseData: any = null;

  const mockRes: any = {
    setHeader: () => {},
    status: (code: number) => {
      statusCode = code;
      return mockRes;
    },
    json: (data: any) => {
      responseData = data;
      return mockRes;
    },
    send: (content: any) => {
      responseData = content;
      return mockRes;
    },
  };

  await blogAgentHandler(mockReq, mockRes);

  if (statusCode >= 200 && statusCode < 300) {
    console.log('\n🎉 Blog Draft Created Successfully!');
    console.log(`   Title:         ${responseData?.blog?.title}`);
    console.log(`   Slug:          ${responseData?.blog?.slug}`);
    console.log(`   Status:        ${responseData?.blog?.status} (Safe Draft Mode)`);
    console.log(`   Cover Image:   ${responseData?.blog?.cover_image}`);
    console.log(`   Notification:  ${responseData?.notificationSent ? 'Sent to ar.archanagavas@gmail.com' : 'Skipped/Disabled'}`);
    console.log(`   Review Link:   ${responseData?.reviewUrl || 'https://www.anvitam.com/admin?tab=blogs'}\n`);
    process.exit(0);
  } else {
    console.error('\n❌ Blog Agent failed with status', statusCode);
    console.error('   Error:', responseData?.error || responseData);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
