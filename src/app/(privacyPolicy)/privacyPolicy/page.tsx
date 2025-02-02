import { cookies } from 'next/headers';
import { Navbar } from '@/components/Navbar';

export default async function PrivacyPolicyAndTerms() {
  // Check if the access token exists to if they are logged in to display nav bar
  const hasCookie = (await cookies()).has('accessToken');


  return (
    <div>
      {hasCookie && <Navbar />}
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          Privacy Policy &amp; Terms of Service
        </h1>
        <p className="mb-4">Effective Date: 2025-01-24</p>

        <h2 className="text-xl font-semibold mt-6">Privacy Policy</h2>
        <p className="mt-2">
          Interview Sensei (&quot;the App&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your
          information when you use the App. By using the App, you consent to the collection and use of your information in accordance with this Privacy Policy. 
          If you do not agree with the terms of this Privacy Policy, please do not use the App.
        </p>

        <h3 className="text-lg font-semibold mt-4">1. Information We Collect (all voluntarily provided)</h3>
        <ul className="list-disc pl-6">
          <li>
            Account Information: Usernames, passwords, and email addresses
            required for authentication and communication.
          </li>
          <li>
            Uploaded Data: Resumes, job descriptions, and interview videos
            submitted for AI analysis.
          </li>
          <li>
            Usage Data: Information related to interactions with the App for
            performance monitoring and improvements.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4">2. How We Use Your Information</h3>
        <ul className="list-disc pl-6">
          <li>Generating interview questions and AI-based feedback.</li>
          <li>Storing and managing your interview history.</li>
          <li>Enhancing the performance and user experience of the App.</li>
          <li>We do not sell, rent, or share your information with third parties for marketing purposes.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4">3. Third-Party Services</h3>
        <p>
          Interview Sensei uses OpenAI APIs to generate interview questions and
          provide feedback. By using this service, you acknowledge that your data
          may be processed by OpenAI. We recommend reviewing OpenAI&apos;s privacy
          policy.
        </p>
        <p>
          <strong>Disclaimer:</strong> We do not control or assume liability for
          how OpenAI processes your data.
        </p>

        <h3 className="text-lg font-semibold mt-4">4. Data Security</h3>
        <p>
          We implement industry-standard security measures to protect your
          personal data, including encryption and access control.&nbsp;
          <strong>
            However, we do not guarantee absolute security and disclaim liability
            for any unauthorized access or breaches.
          </strong>
        </p>

        <h3 className="text-lg font-semibold mt-4">5. Data Retention</h3>
        <p>
          Your data is retained only as long as necessary to provide the service.
          You may request deletion of your account and associated data at any time
          by contacting us.
        </p>

        <h3 className="text-lg font-semibold mt-4">6. Your Rights</h3>
        <p>
          You have the right to access, update, or delete your personal
          information. To exercise your rights, please contact us.
        </p>

        <h2 className="text-xl font-semibold mt-6">Terms of Service</h2>

        <h3 className="text-lg font-semibold mt-4">1. Acceptance of Terms</h3>
        <p>
          By accessing or using the App, you acknowledge that you have read,
          understood, and agree to be bound by these Terms of Service.
        </p>

        <h3 className="text-lg font-semibold mt-4">2. Use of the Service</h3>
        <ul className="list-disc pl-6">
          <li>You must be at least 18 years old to use the App.</li>
          <li>You agree not to misuse the App for unlawful purposes.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4">3. Account Responsibility</h3>
        <p>
          You are responsible for maintaining the confidentiality of your login
          credentials.&nbsp;
          <strong>
            We disclaim any liability for unauthorized access to your account.
          </strong>
        </p>

        <h3 className="text-lg font-semibold mt-4">4. Content Ownership</h3>
        <p>
          You retain ownership of any data you upload. By using the App, you grant
          us a limited, non-exclusive license to process your data solely for the
          purpose of providing our services.
        </p>

        <h3 className="text-lg font-semibold mt-4">5. Limitation of Liability</h3>
        <p>
          Interview Sensei is provided &quot;as is&quot; without warranties of any kind.&nbsp;
          <strong>
            To the fullest extent permitted by law, we disclaim all liability for
            damages resulting from your use of the App.
          </strong>
        </p>

        <h3 className="text-lg font-semibold mt-4">6. Governing Law</h3>
        <p>These Terms are governed by the laws of Canada.</p>

        <p className="mt-6">
          For any questions, contact us at kylehasan1@gmail.com.
        </p>
      </div>
    </div>
  );
}
