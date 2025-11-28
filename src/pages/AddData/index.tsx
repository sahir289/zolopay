/* eslint-disable @typescript-eslint/explicit-function-return-type */


// Normal imports instead of lazy loading
import EntityForm from '@/pages/AddData/EntityForm/index';
import EntityHistory from '@/pages/AddData/EntityHistory/EntityHistory';

function DataEntries() {
  return (
    <>
      <div className="flex items-center h-10 justify-between mb-3 mx-1">
      </div>
      <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-7">
        <EntityForm />
        <EntityHistory />
      </div>
    </>
  );
}

export default DataEntries;
