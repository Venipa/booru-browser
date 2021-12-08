import { format } from "date-fns";
import React, { memo, useEffect, useState } from "react";
import { HiCalendar, HiExternalLink } from "react-icons/hi";
import { DownloadItem, downloadsQuery } from "renderer/stores/downloads";
import { useObservable } from "rxjs-hooks";
import { Order } from "@datorama/akita";
import { map } from "rxjs/operators";
import { firstBy } from "thenby";
import { classNames, openDirectory } from "@library/helper";
import { clamp } from "lodash";
import { AutoSizer, List, ListRowRenderer } from "react-virtualized";
function DownloadRow({
  item: d,
  ...props
}: {
  item: DownloadItem;
  [key: string]: any;
}) {
  const progress = d.pogress
      ? {
          ...d.pogress,
          p: clamp((d.pogress.loaded / d.pogress.total) * 100, 0.0, 100.0),
        }
      : undefined,
    date = new Date(d.date);
  return (
    <div {...props}>
      <div
        className={classNames("flex flex-col flex-1 h-20", props.className)}
        onClick={() => d.status === "completed" && openDirectory(d.path!)}>
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
                  <HiExternalLink className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {d.path}
                </p>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                {d.status === "active" && progress ? (
                  <div className="text-green-700 space-x-2 flex items-center">
                    <span>
                      {(progress.loaded / (1024 * 1024)).toFixed(2)}
                      MB / {(progress.total / (1024 * 1024)).toFixed(2)}
                      MB
                    </span>
                    <div className="h-2 w-px bg-gray-300"></div>
                    <span>{progress.p.toFixed(0)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center flex-shrink-0 space-x-1.5">
                    <div className="space-x-1.5 flex items-center">
                      <HiCalendar className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <p>
                        Added at{" "}
                        <time dateTime={date.toISOString()}>
                          {format(date, "Pp")}
                        </time>
                      </p>
                    </div>
                    {d.status === "completed" && progress && (
                      <>
                        <div className="h-2 w-px bg-gray-300"></div>
                        <div>
                          {(progress.total / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>
      <div className="h-2"></div>
    </div>
  );
}

export default function () {
  const downloads = useObservable(
    () =>
      downloadsQuery
        .selectAll()
        .pipe(map((x) => x.sort(firstBy((y) => y.date, "desc")))),
    [] as DownloadItem[]
  );
  const RowRender: ListRowRenderer = ({ index, key, style }) => {
    const item = downloads?.[index]!;
    return <DownloadRow key={key} item={item} style={style} />;
  };
  return (
    <React.Fragment>
      <div className="flex flex-col h-full w-full bg-white bg-opacity-50">
        <div className="flex flex-col gap-1.5 lg:gap-2.5 py-2 h-full">
          <div className="flex flex-col flex-1">
            <div className="flex-shrink-0 mx-2">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Downloads
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your downloaded media files
              </p>
            </div>
            <div className="mt-6 flex-1 min-h-0">
              <AutoSizer className="h-full flex-1">
                {({ width, height }) => {
                  return (
                    <List
                      rowCount={downloads.length}
                      rowRenderer={RowRender}
                      height={height}
                      width={width}
                      containerStyle={{ marginRight: 8 }}
                      rowHeight={88}
                      overscanRowCount={6}
                    />
                  );
                }}
              </AutoSizer>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
