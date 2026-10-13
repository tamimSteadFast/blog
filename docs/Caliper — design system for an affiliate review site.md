Caliper.

[Color](#color) [Type](#type) [Space](#space) [Components](#components) [Anatomy](#anatomy) [Rules](#rules)

# Measure first. Then recommend.

Caliper is the design system for an Amazon affiliate review site. It is built for one reader: someone halfway through a buying decision who does not yet trust you. Every component either shows evidence or gets out of the way.

Typefaces**Archivo & Source Serif 4**

Base grid**4px**

Reading measure**70 characters**

Accent colors**Two, strictly rationed**

## Four principles

These decide every argument about a component. If a design choice can't be defended by one of them, cut it.

**Yellow means money** The signal yellow appears on affiliate buttons and the "our pick" marker. Nowhere else — not on headings, not on hover states, not on decoration. Readers learn the code in one scroll, which makes paid links both findable and honest.

**Show the measurement, not a star** Specs are plotted on a shared scale so two products can be compared at a glance. Star ratings compress real differences into decoration, and invented ones break Amazon's rules. If a number wasn't measured or sourced, it doesn't get a bar.

**The verdict comes before the evidence** A reader who already decided shouldn't have to scroll past 2,000 words to act. Quick picks sit near the top; the reasoning sits below for anyone who wants it.

**Quiet everywhere else** One border radius family, two shadow levels, no gradients, no motion that the reader didn't ask for. Restraint is what makes the yellow work.

## Color

A cool, instrument-like base so the two accents carry all the meaning. Petrol is editorial — links, brand, navigation. Yellow is commercial, and it is rationed.

Ink

#15202A

Body text, headings, and the text on yellow buttons.

Paper

#E9EDF0

Page background. Cool, so white cards read as raised.

Surface

#FFFFFF

Cards, tables, and anything holding structured data.

Rule

#C7D1DA

Borders and dividers. Structure is drawn with line, not shadow.

Petrol

#0F6E7A

Links, brand, non-paid buttons, scale bars. 5.4:1 on white.

Signal

#FFCE1F

Affiliate buttons and pick markers only. Always with ink text, never white.

Pro

#1E6B3A

Positive findings. Carried by the glyph, never by color alone.

Con

#A8321F

Drawbacks. A review with no red in it is not a review.

Dark mode lightens petrol to #4FBCC4 and keeps the signal yellow unchanged — it is the one constant across both themes, because its meaning depends on being recognizable.

## Typography

Archivo handles anything structural — headings, labels, specs, buttons — using its width axis to make headlines feel like signage. Source Serif 4 carries article prose, where people read for several minutes at a time.

Page title · Archivo 800 / 115% width

The quietest air purifier we tested

Section · Archivo 700 / 108% width

How we measured noise

Subsection · Archivo 650

What the decibel numbers actually mean

Article body · Source Serif 4 · 19px / 1.65

We ran each unit on its highest setting from one meter away in a closed room and recorded the sound level over ten minutes. The gap between the quietest and loudest unit was 14 decibels, which is roughly the difference between a library and a conversation at the next desk. That difference is the whole reason this comparison exists.

Interface · Archivo 400 / 16px

Buttons, labels, table cells, navigation, and metadata.

Supporting · Archivo 400 / 14px

Captions, disclosure text, dates, and anything that supports the main line without competing with it.

Scale is 1.25 (major third), fluid between mobile and desktop. Headings tighten tracking as they grow; body text never does. Numbers use tabular figures everywhere so spec columns align.

## Space, shape, elevation

A 4px base. Gaps inside a component come from the low end of the scale; gaps between sections come from the high end, so the page breathes in a predictable rhythm.

4

8

12

16

24

32

48

64

96

Articles hold a 70-character measure. Serif at that width with 1.65 line-height is the most comfortable sustained reading setting in the system.

3px\
inputs, chips

6px\
buttons, boxes

10px\
cards, tables

pill\
badges only

Two shadow levels exist. Level one lifts an affiliate button off the page. Level two is reserved for the single recommended product card. Everything else is separated by a 1px rule.

## Components

Placeholder content uses air purifiers, since its specs are measurable and show the scale bar doing real work. Swap in your own niche once Section 0 of the build brief is filled in.

### Buttons

[Read the full test](#components) [Compare all six](#components) [See the methodology](#components)

[Check price on AmazonPaid link](#components)

Prices change often, so we don't print them.

The affiliate button is the only yellow element on a page. It carries `rel="sponsored nofollow noopener"`, labels itself as a paid link, and goes full width on mobile for a comfortable thumb target.

### Scale bar

Noise at maximum fan speed48 dB

Quietest tested, 44Loudest tested, 61

Clean air delivery rate243 m³/h

120320

Filter cost per year$58

$30$95

The axis ends are labelled with the real range across the products tested, so a bar means something. Bars are petrol by default and yellow-deep on the recommended product. Never draw a bar for a number you did not measure or cite.

### Verdict

### Our verdict

The Coway Airmega 200M is the one to buy for most bedrooms. It was the second-quietest unit on its top setting and the cheapest to keep running over three years. If your room is larger than 40 m², step up to the 400S instead.

Tested in a 28 m² room over six weeks · Last reviewed 2 October 2026

Sits directly under the article title. One paragraph, one recommendation, one condition under which it changes. No yellow here — the verdict is editorial, not commercial.

### Quick picks

### If you're in a hurry

Six units tested

Best overall

Coway Airmega 200M

Quietest at the price, cheapest filters over three years.

[Check price](#components)

Best for large rooms

Levoit Core 600S

Cleared a 60 m² room in 22 minutes, but it's audible from across it.

[Check price](#components)

Best on a budget

Winix 5500-2

Same filtration for less, with a fiddly control panel.

[Check price](#components)

Placed above the fold on every roundup. The role label is what readers scan for, so it leads the row. Only the top pick wears the yellow marker.

### Product card

Product photo, 4:3

Best overall

### Coway Airmega 200M

For bedrooms up to 40 m² where noise matters more than speed.

- Room sizeup to 40 m²
- Noise, max48 dB
- Filters per year$58

- Quiet enough to sleep next to
- Filters are easy to find

[Check price on Amazon](#components)

Paid link. We don't print prices because they move.

Product photo, 4:3

### Winix 5500-2

For anyone who wants the filtration without the price.

- Room sizeup to 33 m²
- Noise, max55 dB
- Filters per year$44

[Check price on Amazon](#components)

Paid link.

The recommended card gets a yellow border and the system's only level-two shadow. Every other card is identical and quiet, so the hierarchy is unmissable without being loud.

### Comparison table

| Model | Room size | Noise, max | Filters / year | Best for |
| --- | --- | --- | --- | --- |
| Coway Airmega 200M | 40 m² | 48 dB | $58 | Bedrooms |
| Levoit Core 600S | 60 m² | 58 dB | $72 | Open-plan rooms |
| Winix 5500-2 | 33 m² | 55 dB | $44 | Tight budgets |
| Blueair 311i Max | 35 m² | 51 dB | $68 | Allergy season |

A real table with scoped headers, scrolling inside its own container on mobile so the page never moves sideways. The recommended row is tinted, not bolded, so the data stays readable.

### Pros and cons

#### What we liked

- Second-quietest unit on its highest setting
- Filter costs stayed lowest across three years
- Controls stay lit but dim in the dark

#### What we didn't

- Struggles in rooms over 40 m²
- No app, if that matters to you
- Pre-filter needs vacuuming monthly

Both columns must be populated. A product with no listed drawback reads as an advertisement, and readers price that in.

### Disclosure

We earn a commission when you buy through links on this page, at no extra cost to you. As an Amazon Associate we earn from qualifying purchases. It never changes which product we recommend.

Rendered automatically above the first affiliate link on any page carrying products. The small yellow square ties it to the buttons below it, so the color code is taught before it is used.

### Author

TH

#### Tamim Hossain

Tests and writes every review on this site. Six weeks with each unit in a real room, not a lab. Read the full [testing methodology](#components).

Appears at the end of every article and feeds the Person schema. Expertise claims must be true — this box is the difference between a review site and a doorway page.

### Questions

Do air purifiers help with dust?

Yes, for airborne dust. Anything already settled on a surface needs a cloth — a purifier only catches what is moving through it.

How often do filters need replacing?

Every six to twelve months on the models here, depending on how hard you run them.

Native `<details>`, so it works with no JavaScript. Renders FAQPage schema only when the answers are visible on the page.

### Navigation parts

1. [Home](#components)
2. [Air quality](#components)
3. Best air purifiers

#### On this page

- [Our verdict](#components)
- [How we tested](#components)
- [The six units](#components)
- [What to look for](#components)

### Article card

Cover image, 16:9

Comparison

### [Coway 200M or Winix 5500-2: which belongs in a bedroom](#components)

Six weeks with both units in the same room, measured at the same distance.

2 October 20269 min read

### Callout

#### Prices are deliberately missing

Amazon's terms restrict where price data may come from, and a stale price is worse than none. Buttons send you to the live listing instead.

## Article anatomy

The order matters more than any individual component. A reader who is ready to buy should reach a working link within one scroll; a reader who is still deciding should find the reasoning underneath it.

```
┌──────────────────────────────────────────────────────┐
│  Breadcrumb                                          │
│  Title — Archivo 800, two lines maximum              │
│  Author · published · last reviewed                  │
├──────────────────────────────────────────────────────┤
│  Disclosure          ← before any paid link, always  │
├──────────────────────────────────────────────────────┤
│  Verdict             ← one paragraph, one condition  │
├──────────────────────────────────────────────────────┤
│  Quick picks         ← first yellow appears here     │
├──────────────────────────────────────────────────────┤
│  Comparison table                                    │
├────────────────────────────────┬─────────────────────┤
│  How we tested                 │  Table of contents  │
│  Product 1  (card + scales)    │  (sticky, desktop   │
│  Product 2  (card + scales)    │   only)             │
│  …                             │                     │
│  What to look for              │                     │
├────────────────────────────────┴─────────────────────┤
│  Questions (FAQ)                                     │
│  Author box                                          │
│  Related in this cluster                             │
└──────────────────────────────────────────────────────┘
```

Single column up to 1024px. Above that, the table of contents moves into a sticky right rail — it never becomes a left sidebar, which would push the measure past comfortable reading width.

## Rules that are easy to break

Each of these exists because breaking it is tempting and costly.

**Never use yellow for emphasis**The moment a heading, hover state, or icon turns yellow, the color stops meaning "paid link" and the reader stops trusting it. If something needs emphasis, use weight or a rule.

**Never put white text on the signal yellow**Contrast fails immediately. Yellow always carries ink text, in both themes.

**Never draw a scale bar without a labelled axis**A bar with no range is decoration pretending to be data.

**Never ship a product card without a drawback**If you genuinely found none, say what you did not test instead. Empty con columns are the clearest signal of a thin affiliate page.

**Never print a price**Prices move, and Amazon restricts where price data may come from. The button is the price check.

**Never let an affiliate link ship without rel="sponsored"**Build it into the one link component so it cannot be forgotten in Markdown.

**Keep every tap target at 44px**Most affiliate traffic is mobile, and the affiliate button is the one element that must never be missed by a thumb.

**Respect reduced motion and keyboard focus**The focus ring is petrol at 2px with a 3px offset, visible on every interactive element including the yellow buttons.

**Caliper** — a design system for an Astro-based Amazon affiliate review site. Sample content describes air purifiers as placeholder subject matter; the measurements shown are illustrative, not test results. Replace them with real data before publishing anything.