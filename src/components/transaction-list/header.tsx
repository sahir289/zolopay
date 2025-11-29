import { getTransactionFormFields, Role, Status } from "@/constants"
import Modal from "../Modal/modals"
import DynamicForm from "../CommonForm"
import { useEffect, useState } from "react";
import { getAllMerchantByCode, getAllMerchantCodes } from "@/redux-toolkit/slices/merchants/merchantAPI";
import { addAllNotification } from "@/redux-toolkit/slices/AllNoti/allNotifications";
import { useAppDispatch } from "@/redux-toolkit/hooks/useAppDispatch";
import { createPayIn, generateHashCode } from "@/redux-toolkit/slices/payin/payinAPI";import {
  onload as payInLoader,
  setRefreshPayIn,
} from '@/redux-toolkit/slices/payin/payinSlice';
import {
  onload as payOutLoader,
  setRefreshPayOut,
} from '@/redux-toolkit/slices/payout/payoutSlice';
import { useAppSelector } from "@/redux-toolkit/hooks/useAppSelector";
import { selectAllMerchantCodes } from "@/redux-toolkit/slices/merchants/merchantSelector";
import ModalContent from "../Modal/ModalContent/ModalContent";
import { getMerchantCodes } from "@/redux-toolkit/slices/merchants/merchantSlice";
import { createPayOut } from "@/redux-toolkit/slices/payout/payoutAPI";

type PayinsHeaderProps = {
    title?: 'Deposits' | 'Withdrawals',
}

export default function TransactionPageHeader ({ title = 'Deposits'}: PayinsHeaderProps) {
    const dispatch = useAppDispatch();
    const [newTransactionModal, setNewTransactionModal] = useState(false);
    const [oneTime, setOneTime] = useState(false);
    const [formValues, setFormValues] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [link, setLink] = useState('');
    const [payInModal, setPayInModal] = useState(false);
    const merchantCodes = useAppSelector(selectAllMerchantCodes);

    const data = localStorage.getItem('userData');
    let role: keyof typeof Role | null = null;
    if (data) {
        const parsedData = JSON.parse(data);
        role = parsedData.role;
    }

    const transactionModal = () => {
        setNewTransactionModal(!newTransactionModal);
        if (newTransactionModal) {
            // Reset form values when closing modal
            setFormValues({});
            setOneTime(false);
        }
    };
    const handleCreate = async (data: any) => {
        setIsLoading(true);
        try {
          let res;
          const merchantQueryString = new URLSearchParams({
            code: data.code,
          }).toString();
    
          const merchant = await getAllMerchantByCode(merchantQueryString);
          const merchantKey = merchant.public_key;
          if (!merchantKey) {
            dispatch(
              addAllNotification({
                status: Status.ERROR,
                message: 'Merchant key not found',
              }),
            );
            return;
          }
    
          if (
            merchant &&
            (data.amount <
              (merchant as unknown as { min_payin: number })?.min_payin ||
              data.amount >
                (merchant as unknown as { max_payin: number })?.max_payin) &&
            role !== Role.ADMIN
          ) {
            dispatch(
              addAllNotification({
                status: Status.ERROR,
                message: `Amount must be between ${merchant?.min_payin} and ${merchant?.max_payin}`,
              }),
            );
            return;
          }
    
          if (title === 'Deposits') {
            const transformedValues = {
              ...data,
              user_id: data.user_id.replace(/\s+/g, '_'),
              ot: data.ot ? 'y' : 'n',
              key: merchant?.public_key,
              fromUi: true,
            };
            const queryString = new URLSearchParams(
              transformedValues as Record<string, string>,
            ).toString();
    
            dispatch(payInLoader());
    
            if (data.ot === true) {
              res = await createPayIn(queryString);
              dispatch(setRefreshPayIn(true)); //prevent continous rendering
            } else {
              res = await generateHashCode(queryString);
            }
          } else {
            data.fromUi = true;
            dispatch(payOutLoader());
            delete data?.ot
            res = await createPayOut(data, merchantKey);
          }
    
          if (res?.meta?.message || res?.data) {
            //seperate msg for payin payout
            if (title === 'Deposits') {
              dispatch(
                addAllNotification({
                  status: Status.SUCCESS,
                  message: `${
                    res?.meta?.message ? res?.meta?.message : res?.message
                  } And Link copied to clipboard!`,
                }),
              );
            } else {
              dispatch(
                addAllNotification({
                  status: Status.SUCCESS,
                  message: res?.meta?.message ? res?.meta?.message : res?.message,
                }),
              );
            }
            transactionModal();
            // Reset form values on successful submission
            setFormValues({});
            setOneTime(false);
    
            if (title === 'Deposits') {
              dispatch(setRefreshPayIn(true));
              if (res.data?.payInUrl) {
                setLink(res.data.payInUrl);
                setPayInModal(true);
              }
            } else {
              dispatch(setRefreshPayOut(true));
            }
          } else if (res?.error) {
            dispatch(
              addAllNotification({
                status: Status.ERROR,
                message: res.error.message,
              }),
            );
            title === 'Deposits'
              ? dispatch(setRefreshPayIn(true))
              : dispatch(setRefreshPayOut(true));
            transactionModal();
            // Reset form values on error
            setFormValues({});
            setOneTime(false);
          } else {
            dispatch(
              addAllNotification({
                status: Status.SUCCESS,
                message: res.message,
              }),
            );
          }
        } catch (error: any) {
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: error?.message || 'An unexpected error occurred',
            }),
          );
        } finally {
          setIsLoading(false);
        }
      };
    const handleOneTimeChange = (value: boolean, currentFormValues?: any) => {
        setOneTime(value);
        if (currentFormValues) {
            setFormValues({ ...currentFormValues, ot: value });
        }
    };
    
    const handleConfirm = async () => {
        setPayInModal(false);
    };

    const handleCancel = () => {
        setPayInModal(false);
    };
    useEffect(() => {
        if (role !== Role.MERCHANT && role !== Role.ADMIN) {
          return;
        }
        const fetchMerchantCodes = async () => {
          const merchantCodesList = await getAllMerchantCodes();
          if (merchantCodesList) {
            dispatch(getMerchantCodes(merchantCodesList));
          }
        };
    
        fetchMerchantCodes();
    }, [dispatch]);
    useEffect(() => {
        if (payInModal && link) {
          navigator.clipboard.writeText(link);
        }
    }, [payInModal, link]);

    useEffect(() => {
        if (newTransactionModal) {
            // Reset form values when opening modal
            setFormValues({});
            setOneTime(false);
        }
    }, [newTransactionModal]);
    return (
        <>
        <div className="flex justify-between items-center gap-2">
          <div className="text-lg sm:text-xl md:text-2xl font-medium group-[.mode--light]:text-white">
            {title}
          </div>
          {role !== Role.VENDOR && (
            <Modal
              handleModal={transactionModal}
              forOpen={newTransactionModal}
              buttonTitle={`Create ${title}`}
            >
              <DynamicForm
                sections={getTransactionFormFields(merchantCodes.map((merchant) => ({
                        value: merchant.label,
                        label: merchant.label,
                    })), role ?? '', oneTime, handleOneTimeChange).PAYIN}
                onSubmit={handleCreate}
                defaultValues={{ ...formValues, ot: oneTime }}
                isEditMode={false}
                handleCancel={transactionModal}
                isLoading={isLoading}
              />
            </Modal>
          )}
        </div>
        {link && (
            <Modal handleModal={handleCancel} forOpen={payInModal}>
                <ModalContent
                    handleCancelDelete={handleCancel}
                    handleConfirmDelete={handleConfirm}
                >
                    <span
                        style={{
                        cursor: 'pointer',
                        color: 'blue',
                        textDecoration: 'underline',
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(link);
                            dispatch(
                                addAllNotification({
                                status: Status.SUCCESS,
                                message: 'Copied to clipboard!',
                                }),
                            );
                        }}
                    >
                        {link}
                    </span>
                </ModalContent>
            </Modal>
            )}
        </>
    )
}