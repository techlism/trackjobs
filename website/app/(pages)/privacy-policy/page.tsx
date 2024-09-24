export default async function PrivacyPolicy() {
    return (
      <div className="p-4 mx-auto max-w-7xl min-h-[76dvh] flex flex-col justify-center items-start border mt-10 rounded-md shadow-md">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">
          At TrackJobs, we value your privacy and are committed to protecting your personal information. This privacy policy outlines how we handle your data.
        </p>
        <h2 className="text-2xl font-bold mb-2">Data Sharing</h2>
        <p className="mb-4">
          We do not share your data with any third parties, except for the OpenAI API, which we use to summarize job descriptions. Your data is used solely for the purpose of providing and improving our services.
        </p>
        <h2 className="text-2xl font-bold mb-2">Cookies</h2>
        <p className="mb-4">
          We only use essential cookies, specifically authentication cookies, to ensure that you can securely log in and access your account. No other types of cookies are used.
        </p>
      </div>
    );
}