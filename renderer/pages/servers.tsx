import Button from "@/components/Button";
import React, { useState } from "react";
import { HiCheck, HiCheckCircle, HiPencil } from "react-icons/hi";
import { serverQuery, serverStore, ServerType } from "renderer/stores/server";
import { combineLatest, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { useObservable } from "rxjs-hooks";
import { classNames } from "@library/helper";
import { Portal } from "@headlessui/react";
import ServerEditDialog from "@/components/ServerEditDialog";

export default function () {
  const servers = useObservable(
    () =>
      combineLatest([serverQuery.selectAll(), serverQuery.selectActive()]).pipe(
        map(([servers, active]) => {
          if (!active) return servers;
          return servers.map((x) => ({ ...x, active: x.name === active.name }));
        })
      ) as Observable<(ServerType & { active?: boolean })[]>
  );
  return (
    <React.Fragment>
      <div className="flex flex-col h-full w-full bg-black bg-opacity-20 backdrop-filter backdrop-blur-lg">
        <div className="server-list flex flex-col lg:flex-row lg:flex-wrap gap-1.5 lg:gap-2.5 py-2 mx-2">
          {servers?.map((x) => {
            return (
              <div
                key={x.name}
                className={classNames(
                  "bg-gray-800 text-gray-50 bg-opacity-30 backdrop-filter backdrop-blur-lg px-4 py-3 rounded-lg shadow flex items-center space-x-3 select-none lg:max-w-md",
                  !x.active ? "cursor-pointer" : null
                )}
                onClick={() => !x.active && serverStore.setActive(x.name)}>
                {x.active && (
                  <HiCheck className="h-8 w-8 text-white bg-green-500 rounded-full p-1.5  flex-shrink-0" />
                )}
                <div className="flex flex-col flex-1">
                  <div>{x.name}</div>
                  <div>{x.url}</div>
                </div>
                <div className="flex flex-col justify-center">
                  <ServerEditDialog
                    server={x}
                    trigger={
                      <Button
                        onClick={(ev) => {
                          ev.stopPropagation();
                        }}
                        className="button-icon button-dark button-icon-circle">
                        <HiPencil />
                      </Button>
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
}
