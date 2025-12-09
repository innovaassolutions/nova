export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Nova CRM</h1>
        <p className="text-lg text-gray-600 mb-8">
          LinkedIn-first CRM for INNOVAAS sales team
        </p>
        <div className="space-y-4">
          <a
            href="/contacts/upload"
            className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload LinkedIn Contacts
          </a>
        </div>
      </main>
    </div>
  );
}
