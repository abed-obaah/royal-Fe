'use client'

import React, { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  GiftIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Logo from '../../assets/RoyaFi.png';
import MusicDashboard from "@/components/MusicDashboard";
import ReferralDrawer from "@/components/ReferralDrawer";
import NotificationsDrawer from "@/components/Notifications";
import CryptoPaymentModal  from "@/components/BlurModal";
import Wallet from "@/pages/dashboard/wallet";
import Portfolio from "@/pages/dashboard/Portfolio";
import Royalty from "@/pages/dashboard/Royalties";
import Orders from "@/pages/dashboard/order";
import Settings from "@/pages/dashboard/ProfilePage";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { clearCredentials } from "../../slices/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// Create components for each section
const HomeContent = ({ user }: { user: any }) => {
  const isVerified = !!user?.email_verified_at; // true if email_verified_at has a value

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl/7 font-bold text-[#ebecec] sm:truncate sm:text-2xl sm:tracking-tight">
            Good Morning, {user?.name} ☀️
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <span
            className={`inline-flex items-center gap-x-0.5 rounded-md px-2 py-1 text-xs font-medium inset-ring ${
              isVerified
                ? "bg-green-50 text-green-700 inset-ring-green-600/10"
                : "bg-red-50 text-red-700 inset-ring-red-600/10"
            }`}
          >
            {isVerified ? "Verified" : "Not Verified"}
            {!isVerified && (
              <button
                type="button"
                className="group relative -mr-1 size-3.5 rounded-xs hover:bg-red-600/20"
              >
                <span className="sr-only">Remove</span>
                <svg
                  viewBox="0 0 14 14"
                  className="size-3.5 stroke-red-600/50 group-hover:stroke-red-600/75"
                >
                  <path d="M4 4l6 6m0-6l-6 6" />
                </svg>
                <span className="absolute -inset-1" />
              </button>
            )}
          </span>
        </div>
      </div>
      <MusicDashboard />
    </div>
  );
};

// Suspension Modal Component
const SuspensionModal = () => {
  return (
    <Dialog static open={true} onClose={() => {}} className="relative z-[100]">
      <DialogBackdrop className="fixed inset-0 bg-red-900/80 backdrop-blur-sm" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform rounded-2xl bg-red-50 p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex flex-col items-center text-center">
            {/* Warning Icon */}
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
              <ExclamationTriangleIcon className="size-6 text-red-600" aria-hidden="true" />
            </div>
            
            {/* Main Content */}
            <div className="mt-4">
              <h3 className="text-lg font-bold leading-6 text-red-900">
                Account Suspended
              </h3>
              <div className="mt-2">
                <p className="text-sm text-red-700">
                  Your account has been temporarily suspended due to a violation of our terms of service. 
                  Please contact our support team to resolve this issue.
                </p>
              </div>
            </div>

            {/* Bottom Text */}
            <div className="mt-6 border-t border-red-200 pt-4">
              <p className="text-xs text-red-600">
                If you believe this is a mistake, please contact admin immediately.
              </p>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

const navigation = [
  { name: 'Home', href: '#', icon: HomeIcon, component: HomeContent },
  { name: 'Portfolio', href: '#', icon: UsersIcon, component: Portfolio },
  { name: 'Royalties', href: '#', icon: CalendarIcon, component: Royalty },
  { name: 'Wallet', href: '#', icon: DocumentDuplicateIcon, component: Wallet },
  { name: 'Orders', href: '#', icon: ChartPieIcon, component: Orders },
  { name: 'Settings', href: '#', icon: Cog6ToothIcon, component: Settings },
]

const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]

const userNavigation = [
  { name: 'Your profile', href: '#', onClick: 'profile' },
  { name: 'Sign out', href: '#', onClick: 'logout' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Home')
  const [open, setOpen] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const user = useSelector((state: RootState) => state.user.user);
  const token = useSelector((state: RootState) => state.user.token);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleNavClick = (name) => {
    setActiveNav(name);
  };

  const ActiveComponent = navigation.find(item => item.name === activeNav)?.component || HomeContent;

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/"); // Redirect to login page
  };

  const handleUserNavigationClick = (item: any) => {
    if (item.onClick === 'logout') {
      handleLogout();
    } else if (item.onClick === 'profile') {
      handleNavClick('Settings');
    }
  };

  // Check if user is suspended
  const isSuspended = user?.status === 'suspended';

  return (
    <>
      <div className="bg-[#31373e]">
        {/* Suspension Modal - appears when user is suspended */}
        {isSuspended && <SuspensionModal />}
        
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>

              <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-[#222629] px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center justify-center">
                  <img
                    alt="Your Company"
                    src={Logo}
                    className="w-48 h-auto object-contain"
                  />
                </div>

                <nav className="relative flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.name);
                                setSidebarOpen(false);
                              }}
                              className={classNames(
                                item.name === activeNav
                                  ? 'bg-[#333940] text-white'
                                  : 'text-gray-700 hover:bg-[#333940] hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-md/6 font-semibold cursor-pointer',
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  item.name === activeNav ? 'text-white' : 'text-gray-400 group-hover:text-white',
                                  'size-6 shrink-0',
                                )}
                              />
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        <div className="hidden bg-gray-900 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-[#31373e] bg-[#222629] px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center justify-center">
              <img
                alt="Your Company"
                src={Logo}
                className="w-48 h-auto object-contain"
              />
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item.name);
                          }}
                          className={classNames(
                            item.name === activeNav
                              ? 'bg-[#333940] text-white'
                              : 'text-gray-700 hover:bg-[#333940] hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-md/6 font-semibold cursor-pointer',
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              item.name === activeNav ? 'text-white' : 'text-gray-400 group-hover:text-white',
                              'size-6 shrink-0',
                            )}
                          />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[#31373e] bg-[#31373e] px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-m-2.5 p-2.5 text-white hover:text-gray-900 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>

            <div aria-hidden="true" className="h-6 w-px bg-gray-200 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form action="#" method="GET" className="grid flex-1 grid-cols-1">
                <input
                  name="search"
                  placeholder="Search"
                  aria-label="Search"
                  className="col-start-1 row-start-1 block size-full bg-[#31373e] pl-8 text-base text-gray-900 outline-hidden placeholder:text-gray-400 sm:text-md/6"
                />
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400"
                />
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button type="button" onClick={() => setOpen(true)}  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">View notifications</span>
                  <GiftIcon aria-hidden="true" className="size-6" />
                </button>
                <button type="button" onClick={() => setOpenNotif(true)}  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="size-6" />
                </button>

                <div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
                <Menu as="div" className="relative">
                  <MenuButton className="relative flex items-center">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt=""
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5"
                    />
                    <span className="hidden lg:flex lg:items-center">
                      <span aria-hidden="true" className="ml-4 text-md/6 font-semibold text-white">
                        {user?.name || 'User'}
                        {/* {user?.referral_code || 'User'} */}
                      </span>
                      <ChevronDownIcon aria-hidden="true" className="ml-2 size-5 text-gray-400" />
                    </span>
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-[#31373e] py-2 shadow-lg outline-1 outline-gray-900/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    {userNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        <a
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleUserNavigationClick(item);
                          }}
                          className={classNames(
                            'text-gray-300 hover:bg-[#333940] hover:text-white',
                            'block px-3 py-2 text-md/6 font-semibold cursor-pointer'
                          )}
                        >
                          {item.name}
                        </a>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
                <ReferralDrawer open={open} onClose={() => setOpen(false)} />
                <NotificationsDrawer open={openNotif} onClose={() => setOpenNotif(false)} />
              </div>
            </div>
          </div>

          <main className="py-10 bg-[#31373e]">
            <div className="px-4 sm:px-6 lg:px-8">
              <ActiveComponent user={user} />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}