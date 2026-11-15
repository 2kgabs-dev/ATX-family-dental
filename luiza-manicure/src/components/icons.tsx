import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/** Ícones lineares desenhados para a LUIZA: traço único de 1.4, cantos arredondados. */
function Line({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconPolish = (p: IconProps) => (
  <Line {...p}>
    <path d="M10 2.75h4v4.5h-4z" />
    <path d="M8.75 7.25h6.5v2.5h-6.5z" />
    <path d="M7.25 9.75h9.5c.69 0 1.25.56 1.25 1.25v8.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V11c0-.69.56-1.25 1.25-1.25z" />
    <path d="M9 13v5" />
  </Line>
);

export const IconPetal = (p: IconProps) => (
  <Line {...p}>
    <path d="M11 4.5c3.1 3.6 5 6.8 5 9.6a5 5 0 0 1-10 0c0-2.8 1.9-6 5-9.6z" />
    <path d="M8.6 14.6c.3 1.3 1.2 2.2 2.4 2.5" />
    <path d="M18.5 3.5v3M17 5h3" />
  </Line>
);

export const IconFoot = (p: IconProps) => (
  <Line {...p}>
    <path d="M8.7 21.25c-2.1 0-3.2-1.6-3.2-4 0-2.9 1.3-5 1.8-7.3.5-2.2 1.9-3.4 3.7-2.9 1.9.5 2.4 2.5 2.1 4.6-.3 2.2-1.1 3.6-1.1 5.5 0 2.3-1 4.1-3.3 4.1z" />
    <circle cx="13.4" cy="4.3" r="1.25" />
    <circle cx="16.1" cy="5.6" r="1" />
    <circle cx="17.8" cy="7.7" r=".9" />
    <circle cx="18.6" cy="10.1" r=".8" />
  </Line>
);

export const IconSparkle = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 3.5l1.6 5.2 5.4 1.8-5.4 1.8L12 17.5l-1.6-5.2L5 10.5l5.4-1.8z" />
    <path d="M18.5 16.5v4M16.5 18.5h4" />
  </Line>
);

export const IconShield = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 3l7 2.6v5.6c0 4.6-3 8.2-7 9.8-4-1.6-7-5.2-7-9.8V5.6z" />
    <path d="M9 12.2l2.1 2.1 4-4.3" />
  </Line>
);

export const IconHeart = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 19.5s-7.5-4.4-7.5-10A4.25 4.25 0 0 1 12 6.8a4.25 4.25 0 0 1 7.5 2.7c0 5.6-7.5 10-7.5 10z" />
  </Line>
);

export const IconHome = (p: IconProps) => (
  <Line {...p}>
    <path d="M3.5 11 12 4l8.5 7" />
    <path d="M5.5 9.5v10.25h13V9.5" />
    <path d="M10 19.75v-4.5a2 2 0 0 1 4 0v4.5" />
  </Line>
);

export const IconClock = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="8.25" />
    <path d="M12 7.5V12l3 2" />
  </Line>
);

export const IconArrow = (p: IconProps) => (
  <Line {...p}>
    <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />
  </Line>
);

export const IconChevron = (p: IconProps) => (
  <Line {...p}>
    <path d="m9 5.5 6.5 6.5L9 18.5" />
  </Line>
);

export const IconClose = (p: IconProps) => (
  <Line {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Line>
);

export const IconPlus = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 5v14M5 12h14" />
  </Line>
);

export const IconExpand = (p: IconProps) => (
  <Line {...p}>
    <path d="M14.5 4.5h5v5M9.5 19.5h-5v-5M19.5 4.5 13.5 10.5M4.5 19.5l6-6" />
  </Line>
);

/** Marca do WhatsApp (Simple Icons, CC0). */
export const IconWhatsApp = ({ size = 20, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);
