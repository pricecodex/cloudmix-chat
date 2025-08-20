import Image from "next/image";

interface HeaderProps {
  username?: string;
  handleLogout: () => void;
}

function Header({ username, handleLogout }: HeaderProps) {
  return (
    <header className="border-divider flex justify-between border-b bg-white px-6 py-4.5">
      <div>
        <Image src="/assets/logos/cloudmix.svg" alt="Cloudmix Logo" width={146} height={42} />
      </div>
      <div className="flex flex-col">
        <h3 className="text-lg font-medium">{username || "Samurai Meow"}</h3>
        <button className="inline-flex self-end text-base font-normal hover:underline" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
