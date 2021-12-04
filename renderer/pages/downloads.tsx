import { format } from "date-fns";
import React from "react";
import { HiCalendar, HiExternalLink } from "react-icons/hi";
import { downloadsQuery } from "renderer/stores/downloads";
import { useObservable } from "rxjs-hooks";
import { Order } from "@datorama/akita";
import { map } from "rxjs/operators";
import { firstBy } from "thenby";
import { openDirectory } from "@library/helper";

export default function () {
  const downloads = useObservable(() =>
    downloadsQuery
      .selectAll()
      .pipe(map((x) => x.sort(firstBy((y) => y.date, "desc"))))
  );
  return (
    <React.Fragment>
      <div className="flex flex-col h-full w-full bg-white bg-opacity-50">
        <div className="flex flex-col lg:flex-row lg:flex-wrap gap-1.5 lg:gap-2.5 py-2 mx-2">
          <div className="flex flex-col flex-1 space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
              <div>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Downloads
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your downloaded media files
                  </p>

                  <div className="mt-6">
                    <ul role="list" className="space-y-2.5">
                      {downloads && downloads.length > 0 ? (
                        downloads
                          .map((d) => ({ ...d, date: new Date(d.date) }))
                          .map((d) => {
                            return (
                              <li key={d.id} className="flex flex-col flex-1" onClick={() => d.status === "completed" && openDirectory(d.path!)}>
                                <button className="block bg-gray-50 rounded-lg flex-1 border border-gray-200">
                                  <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-indigo-600 truncate">
                                        {`${d.post.id}.${d.post.type}`}
                                      </p>
                                      <div className="ml-2 flex-shrink-0 flex">
                                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                          {d.status}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-2 flex justify-between">
                                      <div className="flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                          <HiExternalLink
                                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                          />
                                          {d.path}
                                        </p>
                                      </div>
                                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <HiCalendar
                                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                        />
                                        <p>
                                          Added at{" "}
                                          <time dateTime={d.date.toISOString()}>
                                            {format(d.date, "Pp")}
                                          </time>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </li>
                            );
                          })
                      ) : (
                        <div className="text-gray-600 flex flex-col justify-center items-center h-96">
                          <span>Nothing has been downloaded yet</span>
                        </div>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
