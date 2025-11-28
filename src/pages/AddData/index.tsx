/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState } from 'react';


// Normal imports instead of lazy loading
import EntityForm from '@/pages/AddData/EntityForm/index';
import EntityHistory from '@/pages/AddData/EntityHistory/EntityHistory';

function DataEntries() {
  const [tabState, setTabState] = useState<number>(0);
  return (
    <>
      <div className="flex items-center h-10 justify-between mb-3 mx-1">
      </div>
      <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-7">
        <EntityForm setTabState={setTabState} />
        <EntityHistory tabState={tabState} />
      </div>
    </>
  );
}

export default DataEntries;
