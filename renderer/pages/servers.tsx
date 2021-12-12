import ServerItem from '@/components/servers/ServerItem';
import React, { useState } from 'react';
import { serverQuery, ServerType } from 'renderer/stores/server';
import { combineLatest, Observable } from 'rxjs';
import { useObservable } from 'rxjs-hooks';
import { map } from 'rxjs/operators';

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
            return <ServerItem key={x.name} item={x} active={x.active} />;
          })}
        </div>
      </div>
    </React.Fragment>
  );
}
