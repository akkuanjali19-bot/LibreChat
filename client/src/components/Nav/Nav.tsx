import React, { useCallback, useEffect, useState, useMemo, memo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
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
      className={`nav-mask transition-opacity duration-200 ease-in-out ${navVisible ? 'active opacity-100' : 'opacity-0'}`}
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
    const isMobile = useMediaQuery('(max-width: 768px)');
    const hasPermission = useHasAccess([PermissionTypes.Chat]);
    const [search, setSearch] = useState('');
    const { ref, onScroll } = useNavScrolling();
    const [storedWidth, setStoredWidth] = useLocalStorage('navWidth', NAV_WIDTH_DESKTOP);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
      useConversationsInfiniteQuery(search);

    const conversations = useMemo(
      () => data?.pages.flatMap((page) => page.items) || [],
      [data],
    );

    const toggleNavVisible = useCallback(() => {
      setNavVisible((prev) => {
        localStorage.setItem('navVisible', JSON.stringify(!prev));
        return !prev;
      });
    }, [setNavVisible]);

    useEffect(() => {
      if (!isMobile && storedWidth !== NAV_WIDTH_DESKTOP) {
        setStoredWidth(NAV_WIDTH_DESKTOP);
      }
    }, [isMobile, storedWidth, setStoredWidth]);

    return (
      <>
        <aside
          id="nav"
          ref={ref}
          className={cn(
            'nav fixed inset-y-0 left-0 z-40 flex flex-col bg-token-main-surface-primary shadow-lg transition-transform duration-200 ease-in-out',
            navVisible ? 'translate-x-0' : '-translate-x-full',
          )}
          style={{
            width: isMobile ? NAV_WIDTH_MOBILE : storedWidth,
          }}
          onScroll={onScroll}
        >
          {/* --- Top New Chat Button --- */}
          <div className="p-3">
            <MemoNewChat />
          </div>

          {/* --- Search Bar --- */}
          <SearchBar search={search} setSearch={setSearch} />

          {/* --- Conversation List --- */}
          {hasPermission(Permissions.Chat) && (
            <Conversations
              conversations={conversations}
              fetchNextPage={fetchNextPage as () => Promise<InfiniteQueryObserverResult<ConversationListResponse>>}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          )}

          {/* --- Optional Bookmarks & Agents --- */}
          <Suspense fallback={null}>
            <BookmarkNav />
          </Suspense>

          <Suspense fallback={null}>
            <AgentMarketplaceButton />
          </Suspense>

          {/* --- Account Settings --- */}
          <Suspense fallback={null}>
            <AccountSettings />
          </Suspense>

          {/* --- 🆕 ABOUT SECTION --- */}
          <div className="mt-4 border-t border-gray-700 pt-4 mx-3">
            <Link
              to="/about"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
              onClick={() => isMobile && toggleNavVisible()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 9V3.75m0 0L9 6m2.25-2.25L13.5 6M12 12h.008v.008H12V12zm0 3h.008v.008H12V15z"
                />
              </svg>
              About
            </Link>
          </div>
        </aside>

        {isMobile && <NavMask navVisible={navVisible} toggleNavVisible={toggleNavVisible} />}
      </>
    );
  },
);

export default Nav;
