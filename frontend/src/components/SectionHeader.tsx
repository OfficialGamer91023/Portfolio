import { AnimatedContent } from './reactbits/AnimatedContent';
import { SplitText } from './reactbits/SplitText';
import { GradientText } from './reactbits/GradientText';

interface SectionHeaderProps {
  /** Small mono label above the title. */
  eyebrow: string;
  /** Plain part of the heading, revealed word by word. */
  title: string;
  /** Trailing words of the heading, rendered in the accent gradient. */
  accent: string;
  description: string;
  descriptionClassName?: string;
}

/**
 * The eyebrow / heading / description block every section opens with.
 *
 * Extracted because all four sections repeated the same markup with different
 * copy; centralising it also means the SplitText word reveal and gradient
 * accent stay identical from section to section.
 */
export function SectionHeader({
  eyebrow,
  title,
  accent,
  description,
  descriptionClassName = 'max-w-xl',
}: SectionHeaderProps) {
  return (
    <div className="mb-16 text-center">
      <AnimatedContent distance={20} duration={0.6}>
        <p className="section-eyebrow">
          <span className="h-px w-6 bg-primary-400/50" aria-hidden="true" />
          {eyebrow}
        </p>
      </AnimatedContent>

      <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem]">
        <SplitText
          tag="span"
          text={title}
          className="text-white"
          splitType="words"
          delay={70}
          duration={0.7}
          from={{ opacity: 0, y: 28 }}
          to={{ opacity: 1, y: 0 }}
        />{' '}
        <GradientText className="heading-accent">{accent}</GradientText>
      </h2>

      <AnimatedContent delay={0.15} distance={20}>
        <p className={`mx-auto mt-6 text-balance text-base leading-relaxed text-muted ${descriptionClassName}`}>
          {description}
        </p>
      </AnimatedContent>
    </div>
  );
}
