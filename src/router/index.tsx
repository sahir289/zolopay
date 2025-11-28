import { useRoutes } from 'react-router-dom';
import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AuthRoutes from '../components/ProtectedRoute/AuthRoutes';
import VendorBankResponseProtectedRoute from '../components/VendorBankResponseProtectedRoute';
import { Role } from '@/constants';
// import { withLazyLoading } from '@/utils/lazyStrategies';
import Users from '@/pages/Users/index';
import MerchantsClients from '@/pages/Clients/Merchant';
import VendorsClients from '@/pages/Clients/Vendors';
import Roles from '@/pages/Roles/index';
import PayInTransaction from '@/pages/TransactionList/Payin';
import PayOutTransaction from '@/pages/TransactionList/Payout';
import Chat from '@/pages/Chat/index';
import Login from '@/pages/Login/index';
import Register from '@/pages/Register/index';
import LandingPage from '@/pages/LandingPage/index';
import ChargeBack from '@/pages/ChargeBack/index';
import AddData from '@/pages/AddData/index';
import Designation from '@/pages/Designation/index';
import PayOutBanks from '@/pages/BankAccount/payOutBanks';
import PayInBanks from '@/pages/BankAccount/payInBanks';
import Unauthorized from '@/pages/Unauthorized/index';
import NotFound from '@/pages/NotFound';
import  VendorBeneficiary from '@/pages/BeneficiaryAccounts/VendorBeneficiary';
import MerchnatBeneficiary from '@/pages/BeneficiaryAccounts/MerchnatBeneficiary';
import  MerchantBoard  from "@/pages/DashboardOverview1/MerchantBoard";
import  VendorBoard  from "@/pages/DashboardOverview1/VendorBoard";
import LazyLayout from '../themes';
import MerchantSettlement from '@/pages/Settlement/MerchantSettlement';
import VendorSettlement from '@/pages/Settlement/VendorSettlement';
import VendorAccountReports from '@/pages/Reports/VendorAccountReports';
import AccountReports from '@/pages/Reports/AccountReports';

function Router(): React.ReactElement | null {
  const routes = [
    {
      path: '/',
      element: (
        <AuthRoutes>
          <Login />
        </AuthRoutes>
      ),
    },
    {
      path: 'auth',
      element: <LazyLayout />,
      children: [
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: 'merchant',
              element: (
                <><ProtectedRoute
                  allowedRoles={[
                    Role.ADMIN,
                    Role.TRANSACTIONS,
                    Role.OPERATIONS,
                    Role.MERCHANT,
                    Role.SUB_MERCHANT,
                    Role.MERCHANT_OPERATIONS,
                  ]} /><MerchantBoard /></>
              ),
            },
            {
              path: 'vendor',
              element: (<>
                <ProtectedRoute
                  allowedRoles={[
                    Role.ADMIN,
                    Role.TRANSACTIONS,
                    Role.OPERATIONS,
                    Role.VENDOR,
                    Role.SUB_VENDOR,
                    Role.VENDOR_ADMIN,
                    Role.VENDOR_OPERATIONS,
                  ]}
                >
                </ProtectedRoute>
                  <VendorBoard />
                </>
              ),
            },
          ],
        },
        {
          path: 'clients',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: 'merchants',
              element: <>
                <ProtectedRoute
                  allowedRoles={[
                    Role.ADMIN,
                    Role.TRANSACTIONS,
                    Role.OPERATIONS,
                    Role.MERCHANT,
                    Role.SUB_MERCHANT,
                    Role.MERCHANT_OPERATIONS,
                  ]}
                />
                <MerchantsClients />
              </>,
            },
            {
              path: 'vendors',
              element: <>
                <ProtectedRoute
                  allowedRoles={[
                    Role.ADMIN,
                    Role.TRANSACTIONS,
                    Role.OPERATIONS,
                    Role.VENDOR,
                    Role.SUB_VENDOR,
                    Role.VENDOR_ADMIN,
                    Role.VENDOR_OPERATIONS,
                  ]}
                />
              <VendorsClients />
              </>,
            },
          ],
        },
        {
          path: 'users',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/users',
              element: <Users />,
            },
          ],
        },
        {
          path: 'reports',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN
              ]}
            />
          ),
          children: [
            {
              path: 'merchants',
              element: <> 
                <ProtectedRoute
                  allowedRoles={[
                    Role.ADMIN,
                    Role.TRANSACTIONS,
                    Role.MERCHANT,
                    Role.SUB_MERCHANT,
                  ]}
                />
                <AccountReports role={''} name={''} />
                </>,
            },
            {
              path: 'vendors',
              element: <> 
                <ProtectedRoute
                  allowedRoles={[
                    Role.ADMIN,
                    Role.TRANSACTIONS,
                    Role.VENDOR,
                    Role.SUB_VENDOR,
                    Role.VENDOR_ADMIN
                  ]}
                />
              <VendorAccountReports role={''} />
              </>,
            },
          ],
        },
        {
          path: 'transaction-list',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: 'payins',
              element: <PayInTransaction />,
            },
            {
              path: 'payouts',
              element: <PayOutTransaction />,
            },
          ],
        },
        {
          path: 'settlement',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: 'merchants',
              element: <> <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
              ]}
            /><MerchantSettlement/></> ,
            },
            {
              path: 'vendors',
              element:<><ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            /><VendorSettlement/></> ,
            },
          ],
        },
        {
          path: 'beneficiaryaccounts',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: 'merchants',
              element:<> <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
              ]}
            /> <MerchnatBeneficiary /></>,
            },
            {
              path: 'vendors',
              element: <><ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            /><VendorBeneficiary /></>,
            },
          ],
        },
        {
          path: 'chargeback',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/chargeback',
              element: <ChargeBack />,
            },
          ],
        },
        {
          path: 'add-data',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/add-data',
              element: (
                <VendorBankResponseProtectedRoute>
                  <AddData />
                </VendorBankResponseProtectedRoute>
              ),
            },
          ],
        },
        {
          path: 'chat',
          element: <Chat />,
        },
        {
          path: 'bankaccounts',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: 'payins',
              element: <><ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            /><PayInBanks /></>,
            },
            {
              path: 'payouts',
              element: <> <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            /><PayOutBanks /></>,
            },
          ],
        },
        {
          path: 'designation',
          element: <ProtectedRoute allowedRoles={[Role.ADMIN]} />,
          children: [
            {
              path: '',
              element: <Designation />,
            },
          ],
        },
        {
          path: 'roles',
          element: <ProtectedRoute allowedRoles={[Role.ADMIN]} />,
          children: [
            {
              path: '',
              element: <Roles />,
            },
          ],
        },
      ],
    },
    {
      path: '/landing-page',
      element: <LandingPage />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/unauthorized',
      element: <Unauthorized />,
    },
    {
      path: '/*',
      element: <NotFound />,
    },
  ];

  return useRoutes(routes);
}

export default Router;