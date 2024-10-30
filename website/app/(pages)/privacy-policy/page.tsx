import { Separator } from "@/components/ui/separator";

export default async function PrivacyPolicy() {
    return (
      <main className="mx-auto max-w-7xl min-h-[95dvh] ">
        <div className="p-4 max-w-[95%] mx-auto flex flex-col justify-center items-start border mt-10 rounded-md shadow-md">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <Separator className="mb-4"/>
        <p className="mb-4">
          At TrackJobs, your privacy is valued and there is a commitment to protecting your personal information. This privacy policy outlines how your data is handled, ensuring transparency and trust in the processes.
        </p>
        <h2 className="text-2xl font-bold mb-2">Data Collection</h2>
        <p className="mb-4">
          TrackJobs only operates on personal information that you provide directly, such as your email address. Additionally, information about your interactions with the services on the platform, including usage data and feedbacks, may be collected for analytics purposes.
        </p>
        <h2 className="text-2xl font-bold mb-2">Data Usage</h2>
        <p className="mb-4">
          The data collected is used to provide and improve the services. This includes personalizing your experience, responding to your inquiries, and enhancing the functionality of the platform. TrackJobs ensures that your data is used responsibly and ethically.
        </p>
        <h2 className="text-2xl font-bold mb-2">Data Sharing</h2>
        <p className="mb-4">
          TrackJobs does not share your data with any third parties, except for the OpenAI API, which is used to summarize job descriptions. Your data is used solely for the purpose of providing and improving the services.
        </p>
        <h2 className="text-2xl font-bold mb-2">Data Security</h2>
        <p className="mb-4">
          Robust security measures are implemented to protect your data from unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits to ensure the highest level of protection.
        </p>
        <p className="mb-4 ">
          If you have any more questions or concerns about the privacy policy, please reach out directly.
        </p>
        </div>
      </main>
    );
}