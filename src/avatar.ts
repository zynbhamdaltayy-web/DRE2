import type {
  Avatar,
  AvatarGender,
  EyeColor,
  HairColor,
  HairStyle,
  ShirtColor,
  SkinTone,
} from "../types";

const skinColors: Record<SkinTone, string> = {
  light: "#F8D7C4",
  fair: "#F1C6A8",
  medium: "#D99A72",
  tan: "#B9784F",
  deep: "#75452F",
};

const eyeColors: Record<EyeColor, string> = {
  brown: "#5A321F",
  darkBrown: "#2E1A12",
  blue: "#4A90D9",
  green: "#4D8B62",
  gray: "#69727D",
};

const hairColors: Record<HairColor, string> = {
  black: "#1E1B1A",
  darkBrown: "#38251C",
  brown: "#6B432D",
  blonde: "#D9AE55",
  auburn: "#8D4A32",
};

const shirtColors: Record<ShirtColor, string> = {
  orange: "#F47A32",
  blue: "#4E83C4",
  green: "#5C9B75",
  purple: "#8468B4",
  pink: "#D9829A",
  yellow: "#D9B84A",
  white: "#F5F3EF",
  black: "#252525",
};

export const avatarOptions = {
  skinTones: [
    {
      value: "light" as SkinTone,
      label: "Light",
    },
    {
      value: "fair" as SkinTone,
      label: "Fair",
    },
    {
      value: "medium" as SkinTone,
      label: "Medium",
    },
    {
      value: "tan" as SkinTone,
      label: "Tan",
    },
    {
      value: "deep" as SkinTone,
      label: "Deep",
    },
  ],

  eyeColors: [
    {
      value: "brown" as EyeColor,
      label: "Brown",
    },
    {
      value: "darkBrown" as EyeColor,
      label: "Dark Brown",
    },
    {
      value: "blue" as EyeColor,
      label: "Blue",
    },
    {
      value: "green" as EyeColor,
      label: "Green",
    },
    {
      value: "gray" as EyeColor,
      label: "Gray",
    },
  ],

  hairStyles: [
    {
      value: "short" as HairStyle,
      label: "Short",
    },
    {
      value: "medium" as HairStyle,
      label: "Medium",
    },
    {
      value: "long" as HairStyle,
      label: "Long",
    },
    {
      value: "ponytail" as HairStyle,
      label: "Ponytail",
    },
    {
      value: "bob" as HairStyle,
      label: "Bob",
    },
    {
      value: "hijab" as HairStyle,
      label: "Hijab",
    },
  ],

  hairColors: [
    {
      value: "black" as HairColor,
      label: "Black",
    },
    {
      value: "darkBrown" as HairColor,
      label: "Dark Brown",
    },
    {
      value: "brown" as HairColor,
      label: "Brown",
    },
    {
      value: "blonde" as HairColor,
      label: "Blonde",
    },
    {
      value: "auburn" as HairColor,
      label: "Auburn",
    },
  ],

  shirtColors: [
    {
      value: "orange" as ShirtColor,
      label: "Orange",
    },
    {
      value: "blue" as ShirtColor,
      label: "Blue",
    },
    {
      value: "green" as ShirtColor,
      label: "Green",
    },
    {
      value: "purple" as ShirtColor,
      label: "Purple",
    },
    {
      value: "pink" as ShirtColor,
      label: "Pink",
    },
    {
      value: "yellow" as ShirtColor,
      label: "Yellow",
    },
    {
      value: "white" as ShirtColor,
      label: "White",
    },
    {
      value: "black" as ShirtColor,
      label: "Black",
    },
  ],
};

function hairShape(
  avatar: Avatar,
  hairColor: string,
): string {
  if (avatar.hijab || avatar.hairStyle === "hijab") {
    return `
      <path
        d="M72 88
           C68 46 94 25 128 25
           C163 25 188 47 184 88
           L175 145
           L80 145
           Z"
        fill="${hairColor}"
      />
      <path
        d="M78 91
           C78 55 97 37 128 37
           C159 37 178 57 178 91
           L166 123
           L90 123
           Z"
        fill="#F2EFEA"
      />
    `;
  }

  switch (avatar.hairStyle) {
    case "short":
      return `
        <path
          d="M76 91
             C70 52 92 28 126 28
             C162 28 184 51 179 91
             L162 78
             L151 54
             C137 64 113 68 91 62
             L84 88
             Z"
          fill="${hairColor}"
        />
      `;

    case "medium":
      return `
        <path
          d="M71 99
             C65 48 91 25 128 25
             C166 25 191 52 184 102
             L165 126
             L88 126
             L72 100
             Z"
          fill="${hairColor}"
        />
      `;

    case "long":
      return `
        <path
          d="M70 108
             C64 49 91 24 128 24
             C166 24 193 51 185 109
             L176 169
             L158 185
             L145 126
             L104 126
             L93 185
             L76 168
             Z"
          fill="${hairColor}"
        />
      `;

    case "ponytail":
      return `
        <circle
          cx="187"
          cy="75"
          r="24"
          fill="${hairColor}"
        />
        <path
          d="M73 103
             C67 51 92 26 128 26
             C164 26 187 51 182 104
             L164 126
             L91 126
             Z"
          fill="${hairColor}"
        />
      `;

    case "bob":
      return `
        <path
          d="M69 111
             C63 50 91 24 128 24
             C166 24 193 50 187 111
             L171 151
             L151 162
             L151 112
             L104 112
             L104 162
             L84 151
             Z"
          fill="${hairColor}"
        />
      `;

    default:
      return "";
  }
}

export function avatarMarkup(
  avatar: Avatar,
  size = 320,
): string {
  const skin = skinColors[avatar.skinTone];
  const eyes = eyeColors[avatar.eyeColor];
  const hair = hairColors[avatar.hairColor];
  const shirt = shirtColors[avatar.shirtColor];

  const isGirl = avatar.gender === "girl";

  return `
    <div
      class="avatar-art avatar-art-${avatar.gender}"
      style="--avatar-size:${size}px"
      aria-label="${isGirl ? "Girl" : "Boy"} avatar"
    >
      <svg
        viewBox="0 0 256 420"
        role="img"
        aria-hidden="true"
      >
        <ellipse
          cx="128"
          cy="405"
          rx="70"
          ry="10"
          fill="rgba(0,0,0,0.08)"
        />

        <path
          d="M92 298
             L82 382
             L110 382
             L128 325
             L146 382
             L174 382
             L164 298
             Z"
          fill="#33343A"
        />

        <path
          d="M92 376
             C84 376 77 383 77 391
             L77 397
             L114 397
             L114 390
             C114 382 105 376 92 376
             Z"
          fill="#FFFFFF"
        />

        <path
          d="M164 376
             C151 376 142 382 142 390
             L142 397
             L179 397
             L179 391
             C179 383 172 376 164 376
             Z"
          fill="#FFFFFF"
        />

        <path
          d="M83 214
             C70 230 64 255 67 291
             L86 327
             L170 327
             L189 291
             C192 255 186 230 173 214
             Z"
          fill="${shirt}"
        />

        <path
          d="M105 209
             C109 225 118 233 128 233
             C138 233 147 225 151 209
             Z"
          fill="${skin}"
        />

        <rect
          x="101"
          y="191"
          width="54"
          height="48"
          rx="22"
          fill="${skin}"
        />

        <ellipse
          cx="128"
          cy="130"
          rx="55"
          ry="69"
          fill="${skin}"
        />

        ${hairShape(avatar, hair)}

        <ellipse
          cx="106"
          cy="132"
          rx="6"
          ry="9"
          fill="${eyes}"
        />

        <ellipse
          cx="150"
          cy="132"
          rx="6"
          ry="9"
          fill="${eyes}"
        />

        <circle
          cx="108"
          cy="130"
          r="2"
          fill="#FFFFFF"
        />

        <circle
          cx="152"
          cy="130"
          r="2"
          fill="#FFFFFF"
        />

        <path
          d="M118 163
             C124 168 132 168 138 163"
          fill="none"
          stroke="#8E5040"
          stroke-width="3"
          stroke-linecap="round"
        />

        ${
          isGirl
            ? `
              <path
                d="M83 255
                   C71 273 70 297 79 319"
                fill="none"
                stroke="${skin}"
                stroke-width="17"
                stroke-linecap="round"
              />

              <path
                d="M173 255
                   C185 273 186 297 177 319"
                fill="none"
                stroke="${skin}"
                stroke-width="17"
                stroke-linecap="round"
              />
            `
            : `
              <path
                d="M84 255
                   C72 276 73 298 83 319"
                fill="none"
                stroke="${skin}"
                stroke-width="17"
                stroke-linecap="round"
              />

              <path
                d="M172 255
                   C184 276 183 298 173 319"
                fill="none"
                stroke="${skin}"
                stroke-width="17"
                stroke-linecap="round"
              />
            `
        }

        ${
          isGirl
            ? `
              <path
                d="M93 284
                   C105 301 115 309 128 309
                   C141 309 151 301 163 284"
                fill="none"
                stroke="${shirt}"
                stroke-width="5"
                stroke-linecap="round"
              />
            `
            : `
              <path
                d="M95 289
                   L128 309
                   L161 289"
                fill="none"
                stroke="${shirt}"
                stroke-width="5"
                stroke-linecap="round"
              />
            `
        }

        ${
          avatar.hijab || avatar.hairStyle === "hijab"
            ? `
              <path
                d="M79 91
                   C84 55 101 39 128 39
                   C155 39 173 55 178 91"
                fill="none"
                stroke="${hair}"
                stroke-width="8"
                stroke-linecap="round"
              />
            `
            : ""
        }
      </svg>
    </div>
  `;
}

export function createDefaultAvatar(
  gender: AvatarGender = "girl",
): Avatar {
  return {
    gender,
    skinTone: "medium",
    eyeColor: "brown",
    hairStyle: gender === "girl" ? "long" : "short",
    hairColor: "black",
    shirtColor: "orange",
    hijab: false,
  };
}