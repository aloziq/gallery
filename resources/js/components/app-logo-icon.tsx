import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            <path
                d="M10 4C8.89543 4 8 4.89543 8 6V26C8 27.1046 8.89543 28 10 28C11.1046 28 12 27.1046 12 26V20H18C22.4183 20 26 16.4183 26 12C26 7.58172 22.4183 4 18 4H10Z"
                fill="currentColor"
            />
            {/* The inner cutout to make it unique and sharp */}
            <path
                d="M12 10H18C19.1046 10 20 10.8954 20 12C20 13.1046 19.1046 14 18 14H12V10Z"
                fill="hsl(var(--background))"
            />
        </svg>
    );
}
