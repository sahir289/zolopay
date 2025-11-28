/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tab } from '@/components/Base/Headless';

import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { getTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { setActiveTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import AddDataHistory from '../AddData/AddDataHistory';
import AddDataForm from '../AddData/AddDataForm';
// interface dataEntries {
//   tabState: number;
// }

function DataEntries() {
  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const activeTab = useAppSelector(getTabs);
  const [title, setTitle] = useState('Add Bank Response');

  useEffect(() => {
        setTitle('Add Bank Response');
  }, [activeTab]);

  const handleTabChange = (index: number) => {
    dispatch(setActiveTab(index));
  };

  return (
    <div className="mt-8 sm:mt-12">
      <div className="grid grid-cols-12 gap-y-6 sm:gap-y-10 gap-x-4 sm:gap-x-6">
        <div className="col-span-12">
          <div className="flex items-center h-auto sm:h-10 justify-between mb-3 mx-1">
            <div className="p-2 sm:p-3 text-lg sm:text-xl md:text-2xl font-bold">{title}</div>
          </div>
            <AddDataForm setTabState={(state: any) => console.log('Tab state set to:', state)} />
          <div className="relative flex flex-col col-span-12 lg:col-span-12 xl:col-span-12 gap-y-4 sm:gap-y-7">
            <div className="flex flex-col p-2 sm:p-3 box box--stacked">
              <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
                <Tab.Panels className="border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400">
                  <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
                    <AddDataHistory/>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataEntries;
