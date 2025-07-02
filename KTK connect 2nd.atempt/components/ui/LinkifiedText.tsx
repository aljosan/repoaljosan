import React from 'react';

interface LinkifiedTextProps {
  text: string;
}

const LinkifiedText: React.FC<LinkifiedTextProps> = ({ text }) => {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) =>
        urlRegex.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {part}
          </a>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

export default LinkifiedText;
