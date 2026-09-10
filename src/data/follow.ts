import type { Account } from "./accounts";

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowInput {
  followerId: string;
  followingId: string;
}

export const DRE2LEARN_OFFICIAL_USERNAME = "DRE2learn";

function createId(): string {
  return `follow-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function cleanString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export function createFollow(
  input: FollowInput,
): Follow {
  return {
    id: createId(),
    followerId: cleanString(input.followerId),
    followingId: cleanString(input.followingId),
    createdAt: new Date().toISOString(),
  };
}

export function normalizeFollow(
  follow: Follow,
): Follow {
  return {
    ...follow,
    id: cleanString(follow.id) || createId(),
    followerId: cleanString(follow.followerId),
    followingId: cleanString(follow.followingId),
    createdAt:
      cleanString(follow.createdAt) ||
      new Date().toISOString(),
  };
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
  const follower = cleanString(followerId);
  const following = cleanString(followingId);

  return Boolean(
    follower &&
      following &&
      follower !== following,
  );
}

export function isOfficialFollowTarget(
  account: Account,
): boolean {
  return (
    account.official &&
    account.username === DRE2LEARN_OFFICIAL_USERNAME
  );
}

export function canUnfollow(
  account: Account,
): boolean {
  return !isOfficialFollowTarget(account);
}

export function getFollowers(
  follows: Follow[],
  userId: string,
): Follow[] {
  return follows.filter(
    (follow) => follow.followingId === userId,
  );
}

export function getFollowing(
  follows: Follow[],
  userId: string,
): Follow[] {
  return follows.filter(
    (follow) => follow.followerId === userId,
  );
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

export function removeFollow(
  follows: Follow[],
  followerId: string,
  followingId: string,
): Follow[] {
  return follows.filter(
    (follow) =>
      !(
        follow.followerId === followerId &&
        follow.followingId === followingId
      ),
  );
}

export function addFollow(
  follows: Follow[],
  follow: Follow,
): Follow[] {
  if (
    isFollowing(
      follows,
      follow.followerId,
      follow.followingId,
    )
  ) {
    return follows;
  }

  return [...follows, normalizeFollow(follow)];
}

export function ensureOfficialFollow(
  follows: Follow[],
  userId: string,
  officialAccount: Account,
): Follow[] {
  if (!officialAccount.official) {
    return follows;
  }

  if (
    isFollowing(
      follows,
      userId,
      officialAccount.id,
    )
  ) {
    return follows;
  }

  if (userId === officialAccount.id) {
    return follows;
  }

  return addFollow(
    follows,
    createFollow({
      followerId: userId,
      followingId: officialAccount.id,
    }),
  );
}

  
        
