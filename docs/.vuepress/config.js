module.exports = {
    title: '@jfet97/csp',
    description: 'A js library for Communicating Sequential Processes',
    base: '/csp/',
    themeConfig: {
        nav: [
            {
                text: 'Home',
                link: '/',
            },
            {
                text: 'Guide',
                link: '/guide/',
            },
            {
                text: 'API',
                link: 'https://jfet97.github.io/csp/api/',
            },
            {
                text: 'GitHub',
                link: 'https://github.com/jfet97/csp',
            }
        ],
        sidebar: [
            {
                title: 'Guide',
                collapsable: false,
                children: [
                    '/guide/',
                    '/guide/channels',
                    '/guide/operators',
                ]
            },
        ],
        sidebarDepth: 2,
    }
}

