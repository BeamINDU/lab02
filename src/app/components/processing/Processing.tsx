import Image from "next/image";

const Processing = () => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center w-[400px]">
        <div className="flex flex-col items-center">
          <div className="text-l font-bold mb-5">Processing, please wait...</div>
          {/* <Image
            src="/images/spinner.gif"
            alt=""
            width={70}
            height={70}
            className="mb-1 animate-spin"
          /> */}
          <Image src="/images/spinner.gif" alt="Loading..." width={70} height={70} unoptimized />
        </div>
      </div>
    </div>
  );
};

export default Processing;