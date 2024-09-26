import MenuSidebar from "./menuSidebar";

const HomeDesktop = ({ username, handleLogout }) => {
  return (
    <div className="desktop-layout flex min-h-screen">
      <MenuSidebar handleLogout={handleLogout} />
      <div className="flex-1 p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-4 border-b-2 border-green-500 pb-2">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-700">Selamat Datang, {username || "User"}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
