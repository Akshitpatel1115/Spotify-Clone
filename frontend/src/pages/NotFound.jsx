import { Link } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] w-full gap-4 text-center">
      <FiAlertCircle className="text-6xl text-primary" />
      <h1 className="text-4xl font-bold text-white">404</h1>
      <h2 className="text-xl font-semibold text-text-secondary">Page Not Found</h2>
      <p className="text-sm text-text-secondary max-w-sm mt-2">
        We can't seem to find the page you are looking for. It might have been removed or the link is incorrect.
      </p>
      <Link 
        to="/"
        className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-bold text-black transition hover:scale-105"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
