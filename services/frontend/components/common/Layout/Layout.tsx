import { useState, useEffect, useCallback } from 'react'
import cn from 'clsx'
import s from './Layout.module.css'
import dynamic from 'next/dynamic'
// import LoginView from '@components/auth/LoginView'
import { useUI } from '@components/ui/context'
import { Navbar, Footer } from '@components/common'
import ShippingView from '@components/checkout/ShippingView'
import CartSidebarView from '@components/cart/CartSidebarView'
import { Sidebar, Button, LoadingDots } from '@components/ui'
import PaymentMethodView from '@components/checkout/PaymentMethodView'
import CheckoutSidebarView from '@components/checkout/CheckoutSidebarView'
import OrderConfirmView from '@components/checkout/OrderConfirmView'
import { CheckoutProvider } from '@components/checkout/context'
import { MenuSidebarView } from '@components/common/UserNav'
/* ============================================================
   [DISCOUNT BANNER] - Import Discount component for the purple discount code banner.
   This displays a promotional banner showing discount codes fetched from the discounts service.
   ============================================================ */
import Discount from '@components/common/Discount'
/* ============================================================
   [END DISCOUNT BANNER]
   ============================================================ */
import Ad from '@components/common/Ad'
import type { Page } from '@customTypes/page'
import type { Link as LinkProps } from '../UserNav/MenuSidebarView'
import Pages from 'pages/[...pages]'

const Loading = () => (
  <div className="w-80 h-80 flex items-center text-center justify-center p-3">
    <LoadingDots />
  </div>
)

const dynamicProps = {
  loading: Loading,
}

const FeatureBar = dynamic(() => import('@components/common/FeatureBar'), {
  ...dynamicProps,
})

const Modal = dynamic(() => import('@components/ui/Modal'), {
  ...dynamicProps,
  ssr: false,
})

interface Props {
  pageProps: any
}

const ModalView: React.FC<{ modalView: string; closeModal(): any }> = ({
  modalView,
  closeModal,
}) => {
  return (
    <Modal onClose={closeModal}>
      {/* {modalView === 'LOGIN_VIEW' && <LoginView />} */}
      {/* {modalView === 'SIGNUP_VIEW' && <SignUpView />}
      {modalView === 'FORGOT_VIEW' && <ForgotPassword />} */}
    </Modal>
  )
}

const ModalUI: React.FC = () => {
  const { displayModal, closeModal, modalView } = useUI()
  return displayModal ? (
    <ModalView modalView={modalView} closeModal={closeModal} />
  ) : null
}

const SidebarView: React.FC<{
  sidebarView: string
  closeSidebar(): any
}> = ({ sidebarView, closeSidebar }) => {
  return (
    <Sidebar onClose={closeSidebar}>
      {sidebarView === 'CART_VIEW' && <CartSidebarView />}
      {sidebarView === 'SHIPPING_VIEW' && <ShippingView />}
      {sidebarView === 'PAYMENT_VIEW' && <PaymentMethodView />}
      {sidebarView === 'CHECKOUT_VIEW' && <CheckoutSidebarView />}
      {sidebarView === 'MOBILE_MENU_VIEW' && <MenuSidebarView links={links} />}
      {sidebarView === 'ORDER_CONFIRM_VIEW' && <OrderConfirmView />}
    </Sidebar>
  )
}

const SidebarUI: React.FC<{}> = ({}) => {
  const { displaySidebar, closeSidebar, sidebarView } = useUI()
  return displaySidebar ? (
    <SidebarView sidebarView={sidebarView} closeSidebar={closeSidebar} />
  ) : null
}

/* ============================================================
   [STAGING BANNER] - Fixed banner at top of page indicating staging environment.
   This banner is added in Challenge 2 to visually distinguish the staging environment
   from production. It is removed in Challenge 4. The banner stays fixed at the top
   while scrolling, and injects a global style to offset the navbar's sticky position.
   ============================================================ */
const STAGING_BANNER_HEIGHT = '40px'

const StagingBanner: React.FC = () => {
  return (
    <>
      {/* Global style to offset the navbar's sticky top position below the fixed banner.
          Targets the Navbar's root element (CSS Modules compiles to class containing "Navbar_root").
          Also sets the navbar-wrapper to be sticky at the banner height. */}
      <style jsx global>{`
        .staging-banner-offset [class*="Navbar_root"] {
          position: relative !important;
          top: 0 !important;
        }
        .staging-navbar-wrapper {
          position: sticky;
          top: ${STAGING_BANNER_HEIGHT};
          z-index: 40;
        }
        .staging-banner-fixed {
          z-index: 45 !important;
        }
      `}</style>
      <div
        className="staging-banner-fixed"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#f59e0b',
          color: '#1f2937',
          textAlign: 'center',
          padding: '8px 16px',
          fontWeight: 'bold',
          fontSize: '14px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          height: STAGING_BANNER_HEIGHT,
          boxSizing: 'border-box',
        }}
      >
        Staging Environment
      </div>
    </>
  )
}
/* ============================================================
   [END STAGING BANNER]
   ============================================================ */

const Layout: React.FC<Props> = ({ children, pageProps: { ...pageProps } }) => {
  const [pages, setPages] = useState<Page[]>([])

  useEffect(() => {
    getLinks()
  }, [])

  async function getLinks() {
    try {
      const baseUrl = '/api'

      const res = await fetch(`${baseUrl}/pages`)

      if (!res.ok) {
        throw res
      }

      const pages: Page[] = await res.json()

      setPages(pages)
    } catch (errorRes) {
      const error = await errorRes.json()
      console.error(error)
    }
  }

  return (
    <div className={cn(s.root, 'staging-banner-offset')}>
      {/* ============================================================
          [STAGING BANNER] - Renders the fixed staging environment banner at the very top.
          The staging-banner-offset class enables the global CSS that pushes the navbar down.
          paddingTop ensures content isn't hidden behind the fixed banner.
          ============================================================ */}
      <StagingBanner />
      <div style={{ paddingTop: STAGING_BANNER_HEIGHT }}>
      {/* ============================================================
          [END STAGING BANNER]
          ============================================================ */}
      <div className="staging-navbar-wrapper">
        <Navbar />
      </div>
      {/* ============================================================
          [DISCOUNT BANNER] - Renders the purple discount code banner below the navbar.
          This fetches and displays promotional discount codes from the discounts service.
          ============================================================ */}
      <Discount />
      {/* ============================================================
          [END DISCOUNT BANNER]
          ============================================================ */}
      <main className="fit">{children}</main>
      <Ad />
      <Footer pages={pages} />
      <ModalUI />
      <CheckoutProvider>
        <SidebarUI />
      </CheckoutProvider>
      {/* ============================================================
          [STAGING BANNER] - Closing div for the paddingTop wrapper
          ============================================================ */}
      </div>
      {/* ============================================================
          [END STAGING BANNER]
          ============================================================ */}
    </div>
  )
}

export default Layout
