import Button from "@/components/Button";
import React, { useState } from "react";
import { useObservable } from "rxjs-hooks";
import { settingsQuery } from "renderer/stores/settings";
import StorageSettingsView from "@/components/settings/StorageSettingsView";

export default function () {
  const settings = useObservable(
    () => settingsQuery.select(),
    settingsQuery.getValue()
  );

  return (
    <React.Fragment>
      <div className="flex flex-col h-full w-full bg-white">
        <div className="flex flex-col lg:flex-row lg:flex-wrap gap-1.5 lg:gap-2.5 py-2 mx-2">
          <div className="flex flex-col flex-1 space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
              <div>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    General settings
                  </p>
                </div>
              </div>
              <div>
                <div className="mt-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Storage
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Storage settings
                  </p>
                  <div className="mt-4">
                    <StorageSettingsView />
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
