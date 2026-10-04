/**
 * Hand-written content used to prove each template renders without the AI
 * (Phase 2), and as default copy if generation fails. Each sample is a superset:
 * every template's validator picks the keys it needs and drops the rest.
 */
export type Sample = {
  businessType: string;
  businessName: string;
  city: string;
  palette: string;
  content: Record<string, unknown>;
};

export const samples: Sample[] = [
  {
    businessType: "salon",
    businessName: "Kesar Beauty Studio",
    city: "Jaipur",
    palette: "rose",
    content: {
      hero: {
        headline: "Look your best for every occasion",
        subheadline: "Haircuts, bridal makeup and skin care by trained stylists in Malviya Nagar, Jaipur.",
        cta_label: "Book a visit",
      },
      about: {
        body: "Kesar Beauty Studio opened in 2016 with two chairs and a simple promise: honest advice and clean, careful work. Today our team of six stylists looks after brides, college students and working professionals across Jaipur. We use branded products and sterilise every tool after each use.",
      },
      services: [
        { name: "Haircut & styling", description: "Cuts, blow-dry and styling for women, men and kids." },
        { name: "Bridal makeup", description: "HD and airbrush bridal looks with a trial session before the big day." },
        { name: "Facials & skin care", description: "Clean-up, de-tan and hydrating facials suited to your skin type." },
        { name: "Hair colour", description: "Global colour, highlights and root touch-ups with ammonia-free options." },
      ],
      contact: {
        address: "B-24, Shopping Centre, Malviya Nagar, Jaipur 302017",
        phone: "+91 98290 41122",
        hours: "Tue to Sun, 10 am to 8 pm. Monday closed.",
      },
      highlights: [
        { title: "Trained stylists", body: "Every stylist is certified and has at least three years of experience." },
        { title: "Hygiene first", body: "Fresh towels and sterilised tools for every single client." },
        { title: "Fair prices", body: "Clear rate card shown upfront, no surprise add-ons at billing." },
      ],
      faq: [
        { question: "Do I need an appointment?", answer: "Walk-ins are welcome, but booking ahead on weekends saves waiting time." },
        { question: "Do you do bridal makeup at home?", answer: "Yes, our bridal team travels anywhere within Jaipur for an extra charge." },
        { question: "Which products do you use?", answer: "We use L'Oréal Professionnel, Lakmé and O3+ products for all services." },
      ],
    },
  },
  {
    businessType: "tuition",
    businessName: "Bright Path Classes",
    city: "Lucknow",
    palette: "indigo",
    content: {
      hero: {
        headline: "Small batches, big improvement in marks",
        subheadline: "Maths and Science coaching for Classes 8 to 12, CBSE and UP Board, in Gomti Nagar.",
        cta_label: "Book free demo",
      },
      about: {
        body: "Bright Path Classes is run by Anjali Verma, an M.Sc. Physics teacher with twelve years of classroom experience. Batches are capped at twelve students so every child gets attention. Parents receive a monthly progress report and can meet the teacher any Saturday.",
      },
      services: [
        { name: "Class 8 to 10", description: "Maths and Science foundation with weekly tests and doubt sessions." },
        { name: "Class 11 & 12", description: "Physics, Chemistry and Maths for CBSE and UP Board exams." },
        { name: "Board exam crash course", description: "Two-month revision with sample papers and timed practice." },
      ],
      contact: {
        address: "2/115, Vibhuti Khand, Gomti Nagar, Lucknow 226010",
        phone: "+91 94150 77310",
        hours: "Mon to Sat, 3 pm to 8 pm",
      },
      highlights: [
        { title: "Max 12 students", body: "Small batches so no question goes unanswered." },
        { title: "Weekly tests", body: "Regular practice tests to track every student's progress." },
        { title: "Parent updates", body: "Monthly report card and open Saturday meetings with parents." },
      ],
      faq: [
        { question: "Is there a free demo class?", answer: "Yes, attend two demo classes free before deciding to join." },
        { question: "What are the fees?", answer: "Fees depend on class and subjects. Call us and we will share the full fee chart." },
      ],
    },
  },
  {
    businessType: "restaurant",
    businessName: "Annapurna Bhojanalaya",
    city: "Pune",
    palette: "marigold",
    content: {
      hero: {
        headline: "Home-style Maharashtrian thali since 1998",
        subheadline: "Unlimited thali, fresh puran poli and misal pav, a short walk from Deccan Gymkhana.",
        cta_label: "Reserve a table",
      },
      about: {
        body: "Annapurna Bhojanalaya is a family-run restaurant started by the Kulkarni family in 1998. The menu changes with the season and everything is cooked fresh each morning using recipes from our grandmother's kitchen. We seat sixty guests and welcome families, students and office groups.",
      },
      services: [
        { name: "Unlimited thali", description: "Two sabzis, dal, rice, chapati, koshimbir and a sweet, served unlimited." },
        { name: "Breakfast specials", description: "Misal pav, poha, sabudana khichdi and filter coffee from 8 am." },
        { name: "Party orders", description: "Catering for pujas, birthdays and office lunches of 20 to 200 people." },
        { name: "Takeaway & delivery", description: "Order on call or through Swiggy and Zomato." },
      ],
      contact: {
        address: "1184 FC Road, Near Deccan Gymkhana, Pune 411004",
        phone: "+91 98220 55018",
        hours: "Every day, 8 am to 3:30 pm and 7 pm to 10:30 pm",
      },
      highlights: [
        { title: "Since 1998", body: "Over twenty-five years of serving the same trusted recipes." },
        { title: "Pure vegetarian", body: "A completely vegetarian kitchen with no onion-garlic thali on request." },
        { title: "Fresh daily", body: "Everything is cooked the same morning, nothing is reheated." },
      ],
      faq: [
        { question: "Do you take table reservations?", answer: "Yes, call us to reserve for groups of six or more, especially on Sundays." },
        { question: "Is the thali really unlimited?", answer: "Yes, everything except the sweet is served unlimited." },
        { question: "Do you have parking?", answer: "Two-wheeler parking is available in front; cars can use the FC Road pay parking." },
      ],
    },
  },
];

export function getSample(businessType: string) {
  return samples.find((s) => s.businessType === businessType) ?? samples[0];
}
