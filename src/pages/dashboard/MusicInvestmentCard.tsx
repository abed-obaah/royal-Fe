import React from "react";

const MusicInvestmentCard = () => {
  return (
    <div className="w-full bg-white min-h-screen flex flex-col items-center">
      {/* Background image / banner */}
      <div className="relative w-full">
        <img
          src="https://images.unsplash.com/photo-1502877338535-766e1452684a" // replace with background car image
          alt="Background"
          className="w-full h-64 object-cover"
        />
        <h1 className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-3xl md:text-5xl font-bold text-pink-600 drop-shadow-lg">
          Bad Guy, Bye Bye
        </h1>
      </div>

      {/* Main content container */}
      <div className="relative -mt-20 bg-white shadow-xl rounded-xl p-6 w-11/12 md:w-4/5 lg:w-3/5">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left - Card */}
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-gray-100 shadow-md rounded-xl p-4 w-60">
              <img
                src="https://picsum.photos/200" // replace with KRYSTOF image
                alt="Artist"
                className="rounded-xl mb-4"
              />
              <h2 className="font-bold text-lg">KRYSTOF</h2>
              <p className="text-sm text-gray-600">Bad Guy, Bye Bye</p>
              <button className="mt-4 w-full bg-red-500 text-white font-semibold py-2 rounded-md">
                RELEASED ON 06.06.2025
              </button>
            </div>
          </div>

          {/* Right - Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Bad Guy, Bye Bye</h2>
            <p className="text-gray-600 text-sm mb-4">
              By <span className="font-semibold">KRYSTOF</span> • Pop • Austria
            </p>
            <p className="text-gray-700 text-sm mb-6">
              KRYSTOF’s latest single "Bad Guy, Bye Bye" is currently
              experiencing major success in Austrian Radio, and you have the
              unique opportunity to be part of it now and get the last shares!
            </p>

            {/* Earnings details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="text-center border p-3 rounded-lg">
                <p className="font-bold">Earn from</p>
                <p className="text-sm text-gray-600">streams & radio</p>
              </div>
              <div className="text-center border p-3 rounded-lg">
                <p className="font-bold">Earn proceeds</p>
                <p className="text-sm text-gray-600">for 70 years</p>
              </div>
              <div className="text-center border p-3 rounded-lg">
                <p className="font-bold">First proceeds</p>
                <p className="text-sm text-gray-600">4 mth after release</p>
              </div>
            </div>

            {/* Details Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">DETAILS</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Rights: Master & Publishing</li>
                <li>Type: Participation Rights</li>
                <li>Rights Holder: Global Rockstar</li>
                <li>Status: Master</li>
                <li>Release Date: 06.06.2025</li>
                <li>Contract Address: 0xFB667…13aCF52</li>
                <li>Token Standard: ERC1155</li>
                <li>Blockchain: Polygon</li>
                <li>Starting from: 10.00 €</li>
                <li>Break-even: 5.2 million streams</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom action card */}
        <div className="mt-8 flex justify-center">
          <div className="w-full md:w-2/3 bg-gray-100 rounded-xl shadow p-6 flex flex-col items-center text-center">
            <button className="w-full bg-gray-400 text-white font-semibold py-2 rounded-md cursor-not-allowed">
              SOLD OUT
            </button>
            <p className="mt-4 font-semibold">
              Join Global Rockstar and Never Miss an Opportunity Again!
            </p>
            <button className="mt-4 bg-yellow-400 px-6 py-2 rounded-md font-semibold">
              JOIN NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicInvestmentCard;
