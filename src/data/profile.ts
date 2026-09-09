import type { Account } from "./accounts";
import {
  getFollowers,
  getFollowing,
  getFollowerCount,
  getFollowingCount,
  isOfficialFollow,
  type Follow,
} from "./follow";

import type { WriterProfile } from "./writer";

export interface PublicProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: Account["avatar"];
  level: Account["level"];
  xp: number;
  countryCode: string;
  bio: string;
  official: boolean;
  verified: boolean;
  role: Account["role"];
  writer: boolean;
  followersCount: number;
  followingCount: number;
  articleCount: number;
  isFollowing: boolean;
  followsOfficial: boolean;
}

export interface ProfileStatistics {
  followers: number;
  following: number;
  articlesPublished: number;
  xp: number;
  level: Account["level"];
}

export function createPublicProfile(
  account: Account,
  follows: Follow[],
  writerProfile?: WriterProfile | null,
  viewerId?: string,
): PublicProfile {
  const articleCount =
    writerProfile?.publishedArticles ?? 0;

  return {
    id: account.id,
    username: account.username,
    displayName: account.displayName,
    avatar: account.avatar,
    level: account.level,
    xp: account.xp,
    countryCode: account.countryCode,
    bio: account.bio,
    official: account.official,
    verified: account.verified,
    role: account.role,
    writer: account.role === "writer",
    followersCount: getFollowerCount(
      follows,
      account.id,
    ),
    followingCount: getFollowingCount(
      follows,
      account.id,
    ),
    articleCount,
    isFollowing:
      viewerId && viewerId !== account.id
        ? getFollowing(
            follows,
            viewerId,
          ).some(
            (follow) =>
              follow.followingId === account.id,
          )
        : false,
    followsOfficial:
      viewerId
        ? isOfficialFollow(
            follows,
            viewerId,
          )
        : false,
  };
}

export function getProfileStatistics(
  account: Account,
  follows: Follow[],
  writerProfile?: WriterProfile | null,
): ProfileStatistics {
  return {
    followers: getFollowerCount(
      follows,
      account.id,
    ),
    following: getFollowingCount(
      follows,
      account.id,
    ),
    articlesPublished:
      writerProfile?.publishedArticles ?? 0,
    xp: account.xp,
    level: account.level,
  };
}

export function canViewPublicProfile(
  account: Account | null,
): boolean {
  return Boolean(
    account && account.status === "active",
  );
}

export function canEditProfile(
  viewer: Account,
  profileOwnerId: string,
): boolean {
  return viewer.id === profileOwnerId;
}

export function updateProfileBio(
  account: Account,
  bio: string,
): Account {
  return {
    ...account,
    bio: bio.trim(),
    updatedAt: new Date().toISOString(),
  };
}

export function updateProfileCountry(
  account: Account,
  countryCode: string,
): Account {
  return {
    ...account,
    countryCode: countryCode.trim().toUpperCase(),
    updatedAt: new Date().toISOString(),
  };
}

export function getProfileRelationship(
  viewerId: string,
  profileId: string,
  follows: Follow[],
) {
  if (viewerId === profileId) {
    return {
      isSelf: true,
      isFollowing: false,
    };
  }

  return {
    isSelf: false,
    isFollowing: getFollowing(
      follows,
      viewerId,
    ).some(
      (follow) =>
        follow.followingId === profileId,
    ),
  };
}

export function getFollowerProfiles(
  profileId: string,
  follows: Follow[],
): string[] {
  return getFollowers(
    follows,
    profileId,
  ).map((follow) => follow.followerId);
}

export function getFollowingProfiles(
  profileId: string,
  follows: Follow[],
): string[] {
  return getFollowing(
    follows,
    profileId,
  ).map((follow) => follow.followingId);
}