
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Mail, Phone, Code, LifeBuoy } from 'lucide-react';

const faqs = [
  {
    question: "How do I apply for a leave?",
    answer: "Navigate to the 'Apply for Leave' section from the sidebar. You can choose to apply for a single day or a longer period. Select the dates and meal types (lunch/dinner) you wish to skip and submit the form.",
  },
  {
    question: "How is my monthly bill calculated?",
    answer: "Your bill is calculated based on the number of meals you have taken in a month. Each meal has a fixed charge. You can view a detailed breakdown of your bill, including total meals and charges, in the 'My Bills' section.",
  },
  {
    question: "Can I change my meal plan?",
    answer: "Yes, you can request to change your meal plan (e.g., from Full Day to Lunch Only) from the 'Settings' page under the 'Meal Plan' tab. Please note that plan changes are subject to admin approval.",
  },
  {
    question: "Where can I see the daily menu?",
    answer: "The daily menu for lunch and dinner is displayed on your dashboard. You can also select different dates to view the menu for past or upcoming days.",
  },
];

export default function StudentSupportPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-top-5 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers to common questions or get in touch with our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Developer</CardTitle>
              <CardDescription>
                Facing a technical issue or found a bug? Let us know.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Email for Bugs</span>
                  <a
                    href="mailto:dev.support@messo.com"
                    className="text-sm text-primary hover:underline"
                  >
                    dev.support@messo.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Code className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Response Time</span>
                  <p className="text-sm text-muted-foreground">
                    Typically within 24-48 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
