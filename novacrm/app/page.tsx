import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-mocha-base">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/nova-crm-logo.svg"
            alt="Nova CRM"
            width={200}
            height={60}
            priority
            className="w-auto h-auto"
          />
        </div>
        <p className="text-mocha-subtext0 text-lg">
          LinkedIn-first CRM for INNOVAAS Sales Team
        </p>
      </div>
    </main>
  );
}
