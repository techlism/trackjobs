import type { HTMLNode } from "./resume-data-to-html-server";

interface ResumeStyle {
    fontFamily: string;
    fontSize: {
        h1: string;
        h2: string;
        h3: string;
        body: string;
        small: string;
    };
    spacing: {
        section: string;
        item: string;
        line: string;
    };
    colors: {
        primary: string;
        text: string;
        link: string;
        border: string;
        muted : string;
    };
    margins: {
        page: string;
        section: string;
        item: string;
    };
}

const style: ResumeStyle = {
    fontFamily: "'Source Serif 4', serif",
    fontSize: {
        h1: "1.2rem",
        h2: "1rem",
        h3: "0.95rem",
        body: "0.82rem",
        small: "0.7rem"    // Keeping the date size as requested
    },
    spacing: {
        section: "0.55rem",
        item: "0.25rem",
        line: "1.15"
    },
    colors: {
        primary: "#2c3e50",
        text: "#333333",
        link: "#2563eb",
        border: "#e5e7eb",
        muted: "#666666"
    },
    margins: {
        page: "0.5rem",
        section: "0.6rem",
        item: "0.35rem"
    }
};

const styleNode: HTMLNode = {
    tag: 'style',
    children: [`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: ${style.fontFamily};
            line-height: ${style.spacing.line};
        }
        body {                
            margin: ${style.margins.page} auto;
            color: ${style.colors.text};
            padding: 0 ${style.margins.page};
        }
        h1 {
            font-size: ${style.fontSize.h1};
            color: ${style.colors.primary};
            margin-bottom: ${style.spacing.section};
            text-align: center;
            font-weight: 600;
        }
        h2 {
            font-size: ${style.fontSize.h2};
            color: ${style.colors.primary};
            margin-bottom: ${style.spacing.item};
            border-bottom: 1px solid ${style.colors.border};
            text-transform: uppercase;
            font-weight: 600;
            padding-bottom: 0.15rem;
        }
        nav {
            text-align: center;
            margin-bottom: ${style.spacing.section};
            font-size: ${style.fontSize.small};
        }
        a {
            color: ${style.colors.link};
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        section {
            margin-bottom: ${style.spacing.section};
        }
        .section-item {
            margin-bottom: ${style.spacing.item};
            position: relative;
            padding-right: 7rem; /* Space for date */
        }
        p {
            font-size: ${style.fontSize.body};
            margin-bottom: ${style.spacing.item};
        }
        .date-container {
            position: absolute;
            right: 0;
            top: 0;
            font-size: ${style.fontSize.small};
            color: ${style.colors.muted};
            font-style: italic;
            text-align: right;
            width: 11rem; /* Fixed width for date container */
            overflow: hidden;
            white-space: nowrap;
        }
        nav > * {
            margin: 0 0.25rem;
        }
        nav > * + *::before {
            content: "•";
            margin: 0 0.25rem;
            color: ${style.colors.text};
        }
        .project-links {
            margin-top: 0.15rem;
            font-size: ${style.fontSize.small};
            font-style: italic;
        }
        .project-links a {
            margin-right: 0.75rem;
        }
    `]
};