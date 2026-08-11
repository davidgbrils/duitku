"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const SUCCESS_ANIMATION_SRC = "/animations/success_payment.json";

type SuccessAnimationProps = {
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
};

/**
 * Animasi sukses (check mark) untuk konfirmasi keberhasilan,
 * misalnya success payment atau notifikasi sukses lainnya.
 */
export function SuccessAnimation({
  className,
  loop = true,
  autoplay = true,
}: SuccessAnimationProps) {
  return (
    <DotLottieReact
      src={SUCCESS_ANIMATION_SRC}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
}
