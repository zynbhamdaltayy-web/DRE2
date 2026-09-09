import {
  DRE2LEARN_OWNER_ID,
  isOfficialAccount,
  type Account,
} from "./accounts";

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowStats {
  followers: number;
  following: number;
}

function createId(): string {
  return `follow-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function isFollowing(
  follows: Follow[],
  followerId: string,
  followingId: string,
): boolean {
  return follows.some(
    (follow) =>
      follow.followerId === followerId &&
      follow.followingId === followingId,
  );
}

export function canFollow(
  followerId: string,
  followingId: string,
): boolean {
  if (!followerId || !followingId) {
    return false;
  }

  if (followerId === followingId) {
    return false;
  }

  return true;
}

export function canUnfollow(
  followingId: string,
): boolean {
  return followingId !== DRE2LEARN_OWNER_ID;
}

export function followUser(
  follows: Follow[],
  followerId: string,
  followingId: string,
): Follow[] {
  if (!canFollow(followerId, followingId)) {
    return follows;
  }

  if (isFollowing(follows, followerId, followingId)) {
    return follows;
  }

  const follow: Follow = {
    id: createId(),
    followerId,
    followingId,
    createdAt: nowIso(),
  };

  return [...follows, follow];
}

export function unfollowUser(
  follows: Follow[],
  followerId: string,
  followingId: string,
): Follow[] {
  if (!canUnfollow(followingId)) {
    return follows;
  }

  return follows.filter(
    (follow) =>
      !(
        follow.followerId === followerId &&
        follow.followingId === followingId
      ),
  );
}

export function forceFollowOfficialAccount(
  follows: Follow[],
  userId: string,
): Follow[] {
  if (!userId || userId === DRE2LEARN_OWNER_ID) {
    return follows;
  }

  return followUser(
    follows,
    userId,
    DRE2LEARN_OWNER_ID,
  );
}

export function ensureOfficialFollowForAllUsers(
  follows: Follow[],
  accounts: Account[],
): Follow[] {
  let result = [...follows];

  for (const account of accounts) {
    if (
      account.id !== DRE2LEARN_OWNER_ID &&
      !isOfficialAccount(account)
    ) {
      result = forceFollowOfficialAccount(
        result,
        account.id,
      );
    }
  }

  return result;
}

export function getFollowers(
  follows: Follow[],
  userId: string,
): string[] {
  return follows
    .filter((follow) => follow.followingId === userId)
    .map((follow) => follow.followerId);
}

export function getFollowing(
  follows: Follow[],
  userId: string,
): string[] {
  return follows
    .filter((follow) => follow.followerId === userId)
    .map((follow) => follow.followingId);
}

export function getFollowerCount(
  follows: Follow[],
  userId: string,
): number {
  return getFollowers(follows, userId).length;
}

export function getFollowingCount(
  follows: Follow[],
  userId: string,
): number {
  return getFollowing(follows, userId).length;
}

export function getFollowStats(
  follows: Follow[],
  userId: string,
): FollowStats {
  return {
    followers: getFollowerCount(follows, userId),
    following: getFollowingCount(follows, userId),
  };
}

export function getOfficialFollowers(
  follows: Follow[],
): string[] {
  return getFollowers(
    follows,
    DRE2LEARN_OWNER_ID,
  );
}

export function isOfficialFollow(
  follow: Follow,
): boolean {
  return follow.followingId === DRE2LEARN_OWNER_ID;
}

export function removeDuplicateFollows(
  follows: Follow[],
): Follow[] {
  const seen = new Set<string>();
  const result: Follow[] = [];

  for (const follow of follows) {
    const key = `${follow.followerId}:${follow.followingId}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(follow);
  }

  return result;
}

export function normalizeFollow(
  follow: Follow,
): Follow {
  return {
    ...follow,
    followerId: follow.followerId.trim(),
    followingId: follow.followingId.trim(),
  };
}