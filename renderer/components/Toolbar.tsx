import Button from "@/components/Button";
import { HiX as FiClose } from "react-icons/hi";
import { serverQuery } from "../stores/server";
import { useObservable } from "rxjs-hooks";
import { ipcRenderer } from "electron";

export default function () {
  const server = useObservable(() => serverQuery.selectActive());
  return (
    <>
      <div className="select-none flex items-center h-toolbar bg-white bg-opacity-50 flex-1 backdrop-filter backdrop-blur-lg">
        <div className="drag leading-12 h-toolbar flex-1 px-4 font-semibold text-gray-900 text-opacity-90">
          Booru Browser
        </div>
        {server && (
          <Button href="/servers" className="btn-sm gap-1">
            <span>{server.name}</span>
          </Button>
        )}
        <div className="flex flex-row items-center controls mx-4 gap-3">
          <Button
            className="button-control button-control-danger"
            onClick={() => ipcRenderer.send("quit")}>
            <FiClose />
          </Button>
        </div>
      </div>
    </>
  );
}
