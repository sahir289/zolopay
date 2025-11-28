/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { getDataEntriesFormFields, Role, Status } from '@/constants';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import DynamicForm from '@/components/CommonForm';
import {
  onload,
} from '@/redux-toolkit/slices/dataEntries/dataEntrySlice';
import {
  resetDataHistory,
} from '@/redux-toolkit/slices/dataEntries/dataEntryAPI';
import { getAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsAPI';
import { getBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSlice';
import {
  addAllNotification,
  removeNotificationById,
} from '@/redux-toolkit/slices/AllNoti/allNotifications';

type ResetHistoryProps = {
  setTabState: any;
};

function EntityForm({ setTabState }: ResetHistoryProps) {
  const dispatch = useAppDispatch();
  const [newTransactionModal, setNewTransactionModal] = useState(false);
  const [isResetDataLoading, setIsResetDataLoading] = useState(false);
  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | string = '';
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
  }

  // Auto-clear notifications after 5 seconds
  const autoClearNotification = (notificationId: string) => {
    setTimeout(() => {
      dispatch(removeNotificationById(notificationId));
    }, 5000);
  };

  // Fetch bank names on component mount
  useEffect(() => {
    const fetchBankNames = async () => {
      try {
        const bankNamesPayInList = await getAllBankNames('PayIn');
        if (bankNamesPayInList) {
          dispatch(getBankNames([...bankNamesPayInList.bankNames]));
        }
      } catch (error) {
        const notificationId = `${Date.now()}-${Math.random()}`;
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: (error as any)?.message || 'Failed to fetch bank names',
          }),
        );
        autoClearNotification(notificationId);
      }
    };

    fetchBankNames();
  }, []); // Empty dependency array to run only once

  const toggleTransactionModal = () =>
    setNewTransactionModal(!newTransactionModal);

  // Debounced handler for creating bank response


  // Debounced handler for resetting entry
  const debouncedHandleResetEntry = debounce(async (data: any) => {
    setIsResetDataLoading(true);
    dispatch(onload());
    try {
      const res = await resetDataHistory(data);
      if (res.error.message && Object.keys(res.error).length > 0) {
        const notificationId = `${Date.now()}-${Math.random()}`;
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: res.error.message || 'Failed to reset entry',
          }),
        );
        autoClearNotification(notificationId);
      } else {
        const notificationId = `${Date.now()}-${Math.random()}`;
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: res.meta.message || 'Entry reset successfully',
          }),
        );
        autoClearNotification(notificationId);
        // dispatch(setRefreshDataEntries(true));
      }
      setTabState(2);
    } catch (error: any) {
      const notificationId = `${Date.now()}-${Math.random()}`;
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: error?.response?.data?.error?.message || 'An error occurred',
        }),
      );
      autoClearNotification(notificationId);
    } finally {
      setIsResetDataLoading(false);
      toggleTransactionModal();
    }
  }, 300);

  return (
    <>
      <div className="grid grid-cols-12 gap-y-10 gap-x-6">
        <div className="col-span-12">
          <div className="relative flex flex-col gap-y-7">
            <div className="flex flex-row p-5 box box--stacked">
              {role &&
                ![Role.VENDOR, Role.VENDOR_OPERATIONS].includes(role) && (
                  <div className="mx-4 w-full flex flex-col gap-4">
                    <DynamicForm
                      sections={getDataEntriesFormFields([], false, role).RESET_ENTRY}
                      onSubmit={debouncedHandleResetEntry}
                      defaultValues={{}}
                      isEditMode={true}
                      handleCancel={toggleTransactionModal}
                      isLoading={isResetDataLoading}
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EntityForm;
