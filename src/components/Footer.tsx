import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Interview Sensei. All rights reserved.</p>
        <div className="flex flex-column space-x-4 mt-2 md:mt-0">
          <Link href="/privacyPolicy" className="text-sm hover:underline">
            Privacy Policy
          </Link>
          <Link href="/termsOfService" className="text-sm hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
