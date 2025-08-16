import Image from "next/image";

interface HeaderProps {
  username?: string;
}

function Header({ username }: HeaderProps) {
  return (
    <header className="px-6 py-4.5 bg-white flex justify-between">
      <div>
        <Image src="/assets/logos/cloudmix.svg" alt="Cloudmix Logo" width={146} height={42} />
      </div>
      <div className="flex flex-col">
        <h3 className="font-medium text-lg">{username || "Samurai Meow"}</h3>
        <button className="text-base font-normal hover:underline inline-flex" onClick={() => console.log("logout")}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
