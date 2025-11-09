import {
  useCallback,
  useEffect,
  useState,
  useMemo,
  memo,
  lazy,
  Suspense,
  useRef,
} from 'react';
import { useRecoilValue } from 'recoil';
import { useMediaQuery } from '@librechat/client';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import type { ConversationListResponse } from 'librechat-data-provider';
import type { InfiniteQueryObserverResult } from '@tanstack/react-query';
import {
  useLocalize,
  useHasAccess,
  useAuthContext,
  useLocalStorage,
  useNavScrolling,
} from '~/hooks';
import { useConversationsInfiniteQuery } from '~/data-provider';
import { Conversations } from '~/components/Conversations';
import SearchBar from './SearchBar';
import NewChat from './NewChat';
import { cn } from '~/utils';
import store from '~/store';

const BookmarkNav = lazy(() => import('./Bookmarks/BookmarkNav'));
const AccountSettings = lazy(() => import('./AccountSettings'));
const AgentMarketplaceButton = lazy(() => import('./AgentMarketplaceButton'));

const NAV_WIDTH_DESKTOP = '260px';
const NAV_WIDTH_MOBILE = '320px';

const NavMask = memo(
  ({ navVisible, toggleNavVisible }: { navVisible: boolean; toggleNavVisible: () => void }) => (
    <div
      id="mobile-nav-mask-toggle"
      role="button"
      tabIndex={0}
      className={`nav-mask transition-opacity duration-200 ease-in-out ${
        navVisible ? 'active opacity-100' : 'opacity-0'
      }`}
      onClick={toggleNavVisible}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleNavVisible();
        }
      }}
      aria-label="Toggle navigation"
    />
  ),
);

const MemoNewChat = memo(NewChat);

const Nav = memo(
  ({
    navVisible,
    setNavVisible,
  }: {
    navVisible: boolean;
    setNavVisible: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const localize = useLocalize();
    const { user } = useAuthContext();
    const { hasAccess } = useHasAccess();
    const [search, setSearch] = useState('');
    const [scrollRef, scrollToTop] = useNavScrolling(navVisible);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [showBookmarks] = useLocalStorage('showBookmarks', false);
    const conversationsQuery = useConversationsInfiniteQuery(search);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = conversationsQuery;
    const flatConversations = useMemo(
      () => (data?.pages ?? []).flatMap((page) => page.conversations ?? []),
      [data],
    );

    const toggleNavVisible = useCallback(() => {
      setNavVisible((prev) => !prev);
    }, [setNavVisible]);

    useEffect(() => {
      if (!isMobile) {
        setNavVisible(true);
      }
    }, [isMobile, setNavVisible]);

    return (
      <>
        {/* Dim background on mobile when nav open */}
        {isMobile && <NavMask navVisible={navVisible} toggleNavVisible={toggleNavVisible} />}

        <nav
          id="sidebar"
          className={cn(
            'fixed left-0 top-0 z-20 flex h-full flex-col border-r border-gray-200 bg-token-main-surface-primary dark:border-gray-700 dark:bg-token-main-surface-secondary',
            navVisible ? 'translate-x-0' : '-translate-x-full',
            'transition-transform duration-200 ease-in-out',
          )}
          style={{
            width: isMobile ? NAV_WIDTH_MOBILE : NAV_WIDTH_DESKTOP,
          }}
        >
          {/* ✅ Custom Brand Header */}
          <div className="flex items-center justify-center h-[60px] border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-lg font-semibold text-gradient tracking-wide">
              ZenoAI <span className="text-xs text-gray-400">by NGAI</span>
            </h1>
          </div>

          {/* 🔍 Search */}
          <div className="p-3">
            <SearchBar search={search} setSearch={setSearch} />
          </div>

          {/* 🧠 New Chat button */}
          <div className="px-3">
            <MemoNewChat />
          </div>

          {/* 💬 Conversations list */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3">
            <Conversations
              search={search}
              flatConversations={flatConversations}
              fetchNextPage={fetchNextPage as () => Promise<InfiniteQueryObserverResult<ConversationListResponse>>}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              scrollToTop={scrollToTop}
            />
          </div>

          {/* ⭐ Bookmarks (optional) */}
          {showBookmarks && (
            <Suspense fallback={null}>
              <BookmarkNav />
            </Suspense>
          )}

          {/* 🧩 Bottom Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 mt-auto space-y-2">
            <Suspense fallback={null}>
              {hasAccess(PermissionTypes.Marketplace, Permissions.Read) && <AgentMarketplaceButton />}
              <AccountSettings />
            </Suspense>
          </div>
        </nav>
      </>
    );
  },
);

export default Nav;
