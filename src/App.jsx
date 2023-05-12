import { useState, useEffect } from "react";

const getActiveTabUrl = async () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        resolve(tabs[0].url);
      } else {
        resolve(null);
      }
    });
  });
};

function App() {
  const [tab, setTab] = useState(1);
  const [isLoading, setIsLoading] = useState(null);
  const [dataResponse, setDataResponse] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  useEffect(() => {
    const savedDataString = localStorage.getItem("apiResponse");
    const savedChatString = localStorage.getItem("chatResponse");
    if (savedDataString) {
      const savedData = JSON.parse(savedDataString);
      const dataReplaced = savedData.response.replace(/&lt;br&gt;/g, "<br>");
      setDataResponse(dataReplaced);
    }
    if (savedChatString) {
      const savedData = JSON.parse(savedChatString);
      const dataReplaced = savedData.response.replace(/&lt;br&gt;/g, "<br>");
      setChatResponse(dataReplaced);
    }
  }, []);

  const getData = async (url, API_URL, chat) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (chat) {
        setChatResponse(data.summary);
        const chatToSave = {
          url: url,
          response: data.summary,
        };
        const dataString = JSON.stringify(chatToSave);
        localStorage.setItem("chatResponse", dataString);
      } else {
        setDataResponse(data.summary);
        const dataToSave = {
          url: url,
          response: data.summary,
        };
        const dataString = JSON.stringify(dataToSave);
        localStorage.setItem("apiResponse", dataString);
      }
    } catch (error) {
      setDataResponse(
        "Error al resumir el texto. Por favor, intente nuevamente."
      );
    }
  };
  const handleClick = async () => {
    const myUrl = await getActiveTabUrl();
    const api_url = "http://localhost:5000/summarize";
    setIsLoading(true);
    localStorage.removeItem("apiResponse");
    await getData(myUrl, api_url, false);
    setIsLoading(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.target[0].value = "";

    const api_url = "http://localhost:5000/chat";
    setIsLoading(true);
    localStorage.removeItem("chatResponse");
    await getData(inputValue, api_url, true);
    setIsLoading(false);
  };
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <>
      <div className=" text-white bg-gray-900 rounded-lg shadow-md w-[500px] py-4 px-6 flex flex-col items-center justify-center">
        <div className="flex gap-8 justify-center items-center">
          <h2
            onClick={() => setTab(1)}
            className={`${
              tab === 1 ? "border-b-4 border-indigo-500" : ""
            } font-semibold uppercase py-6 px-4 cursor-pointer`}
          >
            Chat GPT
          </h2>
          <h2
            onClick={() => setTab(2)}
            className={`${
              tab === 2 ? "border-b-4 border-indigo-500" : ""
            } font-semibold uppercase py-6 px-4 cursor-pointer`}
          >
            Extractor
          </h2>
        </div>
        {tab === 1 ? (
          <div className="w-full" id="componente-Chat">
            <div
              className="mt-auto h-[350px] w-full bg-gray-800 rounded-lg p-4 text-lg overflow-y-scroll
         scrollbar-none"
            >
              {isLoading === true ? (
                <div className="text-center mt-40">Loading</div>
              ) : (
                chatResponse && (
                  <p>
                    <strong className="text-semibold pb-2">
                      {inputValue} <br />
                    </strong>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: chatResponse,
                      }}
                    ></p>
                  </p>
                )
              )}
            </div>
            <form onSubmit={handleSubmit}>
              <input
                onChange={handleChange}
                className="w-full py-2 px-4 text-lg text-zinc-900 outline-none rounded-lg"
                type="text"
              />
              <div className="py-6 flex justify-center">
                <button
                  type="submit"
                  className="px-6 py-4 bg-pink-700 rounded-full uppercase font-semibold"
                >
                  Enviar mensaje
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full" id="componente-resumidor">
            <div
              className="mt-auto h-[390px] w-full bg-gray-800 rounded-lg p-4 text-lg overflow-y-scroll
         scrollbar-none"
            >
              {isLoading === true ? (
                <div className="text-center mt-40">Loading</div>
              ) : (
                <p
                  dangerouslySetInnerHTML={{
                    __html: dataResponse,
                  }}
                ></p>
              )}
            </div>
            <div className="py-6 flex justify-center">
              <button
                className="px-6 py-4 bg-pink-700 rounded-full uppercase font-semibold"
                onClick={handleClick}
              >
                Resumir pagina actual
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
