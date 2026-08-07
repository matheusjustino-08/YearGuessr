'use client';

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';

export function IntlProviderWrapper({
  children,
  messages,
  locale,
}: {
  children: React.ReactNode;
  messages: AbstractIntlMessages;
  locale: string;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error) => {
        if (error.code === 'MISSING_MESSAGE') return;
        console.error(error);
      }}
      getMessageFallback={({ key, namespace }) => {
        return `${namespace ? `${namespace}.` : ''}${key}`;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
