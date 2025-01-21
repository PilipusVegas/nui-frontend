import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faKey, faSignOutAlt, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  return (
    <header className="bg-gradient-to-b from-green-600 to-green-400 text-white px-6 py-2 sticky top-0 z-10 rounded-b-2xl  ">
      <div className="flex items-center justify-between">
        {/* Logo or Title */}
        <h1 className="text-md font-bold text-white tracking-wider">PT. Nico Urban Indonesia</h1>

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={toggleProfile}
            className="flex items-center space-x-2 text-white focus:outline-none"
          >
            {/* Profile Icon */}
            <div className="w-8 h-8 rounded-full bg-gray-200 flex justify-center items-center border-2 border-white">
              <FontAwesomeIcon icon={faUser} className="text-white text-xl" />
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-xl border border-gray-300">
              {/* User Info */}
              <div className="flex items-center space-x-2 px-4 py-2 text-green-600 font-semibold">
                <FontAwesomeIcon icon={faUser}  />
                <span>User Name</span>
              </div>

              {/* Divider */}
              <hr className="border-gray-200 my-2" />

              {/* Dropdown Options */}
              <a
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 hover:bg-green-100 rounded-t-md transition-colors"
              >
                <FontAwesomeIcon icon={faUser} className="text-green-600" />
                <span>Profile</span>
              </a>
              <a
                href="/change-password"
                className="flex items-center space-x-2 px-4 py-2 hover:bg-green-100 transition-colors"
              >
                <FontAwesomeIcon icon={faKey} className="text-green-600" />
                <span>Change Password</span>
              </a>
              <button className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-green-100 rounded-b-md transition-colors">
                <FontAwesomeIcon icon={faSignOutAlt} className="text-green-600" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
