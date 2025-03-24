const NETWORK_A = {
    networkName: 'Hidden IntelNet',
    description: 'A map of intelligence nodes with their connections',
    nodes: [
        {
            id: 'node1',
            name: 'Elon Musk',
            role: 'Messenger',
            details: {
                affiliation: 'SpaceX, Tesla, America PAC',
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Elon_Musk'

            }
        },
        {
            id: 'node2',
            name: 'Peter Thiel',
            role: 'Messenger',
            details: {
                affiliation: 'Palantir, Polymarket, America PAC',
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Peter_Thiel',
            }
        },
        {
            id: 'node3',
            name: 'NATO',
            role: 'Security Organization',
            details: {
                affiliation: 'NATO',
                status: 'active',
                notes: 'NATO is considering invoking Article 5 in accordance with the Cyber policy, and no, it’s not because we “don’t like Elon." It’s because Elon very quietly and rapidly built a low-orbit Direct-to-Cell constellation, in which 265 satellites were in place and operational just two weeks prior to the Nov 5 election. These low-orbit satellites effectively place the equivalent of a hacker’s “Stingray” device in every voting precinct in America.',
                link: 'https://en.wikipedia.org/wiki/NATO'
            }
        },
        {
            id: 'node4',
            name: 'Leonard Leo',
            role: 'Financier',
            details: {
                affiliation: 'Unknown',
                status: 'active',
                notes: ' Far-right predatory billionaire',
                link: 'https://en.wikipedia.org/wiki/Leonard_Leo'
            }
        },
        {
            id: 'node5',
            name: 'Tripp Lite',
            role: 'Election Security Supplier',
            details: {
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Tripp_Lite',
                notes: `Tripp Lite is an election security supplier that was formerly owned by Barre Seid. It was donated to Marble Freedom Trust before being sold to Eaton Corp. in 2021. The company's connections to far-right figures and its role in the election security landscape raise questions about the influence of money in politics and the potential for conflicts of interest. Tripp Lite's technology has implications for election integrity and the role of private interests in shaping public policy.`
            }
        },
        {
            id: 'node6',
            name: 'Eaton Corp.',
            role: 'Tech & Security Partner',
            details: {
                involvement: 'Business and election systems',
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Eaton_Corporation',
                notes: `Eaton Corp. is a technology and security partner that acquired Tripp Lite from Marble Freedom Trust in 2021. The company's partnership with Palantir and its involvement in election systems raise concerns about the implications of private interests on election integrity and national security. Eaton's collaboration with far-right figures and its role in the 2024 presidential election have sparked debates about the influence of money in politics and the potential for foreign interference in elections.`
            }
        },
        {
            id: 'node7',
            name: 'Polymarket',
            role: 'Market Predictor',
            details: {
                involvement: 'Election predictions',
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Polymarket',
            }
        },
        {
            id: 'node8',
            name: 'Donald Trump',
            role: 'Political Figure',
            details: {
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Donald_Trump',
                notes: `Trump acknowledged Musk’s expertise during his campaign, highlighting a possible alliance. Trump is the single largest contributor to the America PAC, which was created by Elon Musk to support his 2024 presidential campaign. The PAC's primary purpose is to finance canvassing operations, with Musk contributing 91% of declared contributions as of December 2024.
                
                Trump has also been known to have private conversations with Musk, as reported by Murdoch’s WSJ.
                
                Additionally, Trump has been in contact with Putin, which raises concerns about the implications of these connections on national security and election integrity.
                
                The PAC's activities and the involvement of figures like Musk and Thiel have sparked debates about the influence of money in politics and the potential for foreign interference in elections.`
            }
        },
        {
            id: 'node9',
            name: 'Vladimir Putin',
            role: 'Political Leader',
            details: {
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Vladimir_Putin',
                notes: `Musk maintained over two years of private contact with Putin, as later reported by Murdoch’s WSJ. This connection raises concerns about the implications of foreign influence on U.S. elections and national security. The nature of their discussions and the potential impact on geopolitical dynamics remain subjects of speculation and scrutiny.`

            }
        },
        {
            id: 'node10',
            name: 'Rupert Murdoch',
            role: 'Media Mogul',
            details: {
                status: 'active',
                affiliation: 'News Corp, Fox News, Wall Street Journal',
                link: 'https://en.wikipedia.org/wiki/Rupert_Murdoch',
                notes: `Murdoch's coverage brought Musk’s interactions with Putin to light, suggesting deeper connections. His media empire has played a significant role in shaping public perception and political narratives, particularly regarding the 2024 presidential election and the influence of technology on politics. Murdoch's reporting has raised questions about the implications of these connections on national security and election integrity.`
            }
        },
        {
            id: 'node11',
            name: 'Palantir',
            role: 'Data Analytics',
            details: {
                ownedBy: 'Peter Thiel',
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Palantir_Technologies',
                notes: `Palantir is a data analytics company co-founded by Peter Thiel. It has been involved in various projects, including election forecasting and security operations. The company's technology has raised concerns about privacy and surveillance, particularly in the context of its connections to government agencies and political figures. Palantir's collaboration with NATO and its role in the 2024 presidential election have sparked debates about the implications of data analytics on democracy and national security.`
            }
        },
        {
            id: 'node12',
            name: 'Barre Seid',
            role: 'Businessman',
            details: {
                from: 'Chicago',
                note: 'Former owner of Tripp Lite; donated the company to Marble Freedom Trust.',
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Barre_Seid',
                notes: `Barre Seid is a businessman from Chicago who was the former owner of Tripp Lite. He donated the company to Marble Freedom Trust before it was sold to Eaton Corp. in 2021. His involvement in the election security landscape has raised questions about the influence of money in politics and the potential for conflicts of interest, particularly in relation to his connections with Leonard Leo and other far-right figures. Seid's actions have implications for election integrity and the role of private interests in shaping public policy.`
            }
        },
        {
            id: 'node13',
            name: 'The America PAC',
            role: 'Super PAC',
            details: {
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/The_America_PAC',
                notes: `The America PAC is a super PAC created by Elon Musk with backing from prominent tech businessmen to support Donald Trump\'s 2024 presidential campaign. Its primary purpose is to finance canvassing operations. Musk is the primary donor, contributing 91% of declared contributions as of December 2024. The PAC's activities and the involvement of figures like Musk and Thiel have sparked debates about the influence of money in politics and the potential for foreign interference in elections.`
            }
        },
        {
            id: 'node14',
            name: 'SpaceX',
            role: 'Aerospace Company',
            details: {
                notes: 'It’s because Elon very quietly and rapidly built a low-orbit Direct-to-Cell constellation, in which 265 satellites were in place and operational just two weeks prior to the Nov 5 election. These low-orbit satellites effectively place the equivalent of a hacker’s “Stingray” device in every voting precinct in America.',
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/SpaceX',
            }
        },
        {
            id: 'node15',
            name: 'Dominion Voting Systems',
            role: 'Election Technology Supplier',
            details: {
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Dominion_Voting_Systems',
            }
        },
        {
            id: 'node16',
            name: 'United States Intelligence Community (IC)',
            role: 'Intelligence Organization',
            details: {
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/United_States_Intelligence_Community',
                notes: `The United States Intelligence Community collaborates with NATO on intelligence sharing and security operations. This collaboration raises concerns about the implications of foreign influence on U.S. elections and national security. The nature of their discussions and the potential impact on geopolitical dynamics remain subjects of speculation and scrutiny.`
            }
        },
        {
            id: 'node17',
            name: 'United States Department of Defense (DoD)',
            role: 'Executive Department',
            details: {
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/United_States_Department_of_Defense',
            }
        },
        {
            id: 'node18',
            name: 'Tesla, Inc.',
            role: 'Automotive and Clean Energy Company',
            details: {
                status: 'active',
                link: 'https://en.wikipedia.org/wiki/Tesla,_Inc.',
            }
        }

    ],
    connections: [
        {
            source: 'node1',
            target: 'node2',
            relationship: 'collaboration',
            date: '',
            details: {
                strength: 'high',
                type: 'business',
                notes: `One week after Musk created his “America PAC” for Trump, Eaton Corp. announced a partnership with Palantir, a company associated with Peter Thiel.`
            }
        },
        {
            source: 'node1',
            target: 'node3',
            relationship: 'triggered concern',
            date: '',
            details: {
                notes: 'NATO considered invoking Article 5 due to Musk’s rapid deployment of a low-orbit Direct-to-Cell satellite constellation.'
            }
        },
        {
            source: 'node4',
            target: 'node5',
            relationship: 'transaction',
            date: '',
            details: {
                notes: 'Following Barre Seid’s transfer of Tripp Lite, Leonard Leo took control of the company.'
            }
        },
        {
            source: 'node5',
            target: 'node6',
            relationship: 'acquisition',
            date: '2021',
            details: {
                notes: 'Leonard Leo eventually sold Tripp Lite to Eaton Corp. in 2021.'
            }
        },
        {
            source: 'node2',
            target: 'node7',
            relationship: 'ownership stake',
            date: '',
            details: {
                notes: 'Peter Thiel holds an ownership interest in Polymarket, renowned for its election forecasts. Polymarket had eerily accurate predictions of a Trump victory, and was raided shortly after the Nov 5 election.'
            }
        },
        {
            source: 'node1',
            target: 'node9',
            relationship: 'private contact',
            date: '',
            details: {
                notes: 'Musk maintained over two years of private contact with Putin, as later reported by Murdoch’s WSJ.'
            }
        },
        {
            source: 'node1',
            target: 'node10',
            relationship: 'media leak',
            date: '',
            details: {
                notes: 'Rupert Murdoch’s coverage brought Musk’s interactions with Putin to light, suggesting deeper connections.'
            }
        },
        {
            source: 'node8',
            target: 'node1',
            relationship: 'political endorsement',
            date: '',
            details: {
                notes: 'Trump acknowledged Musk’s expertise during his campaign, highlighting a possible alliance.'
            }
        },
        {
            source: 'node2',
            target: 'node11',
            relationship: 'ownership',
            date: '',
            details: {
                notes: 'Peter Thiel owns Palantir.'
            }
        },
        {
            source: 'node6',
            target: 'node11',
            relationship: 'partnership',
            date: 'July 2024',
            details: {
                notes: 'One week after Musk created his “America PAC” for Trump, Eaton Corp. announced a partnership with Palantir. The Eaton/Palantir partnership focused on secure erasure of digital footprints on Eaton devices, and on AI management of large datasets - such as large quantities of ballot images.'
            }
        },
        {
            source: 'node12',
            target: 'node5',
            relationship: 'ownership transfer',
            date: '',
            details: {
                notes: 'Barre Seid, former owner of Tripp Lite, donated the company to Marble Freedom Trust before it was sold to Eaton Corp. in 2021.'
            }
        },
        {
            source: 'node1',
            target: 'node13',
            relationship: 'created',
            date: 'July 2024',
            details: {
                notes: 'Elon Musk is the primary donor and creator of The America PAC, financing canvassing operations for Trump\'s 2024 presidential campaign with 91% of the declared contributions.'
            }
        },
        {
            source: 'node1',
            target: 'node14',
            relationship: 'launched constellation',
            date: '',
            details: {
                notes: 'Rapidly built a low-orbit Direct-to-Cell constellation, in which 265 satellites were in place and operational just two weeks prior to the Nov 5 election.'
            }
        },
        {
            source: 'node15',
            target: 'node5', // Example connection to Tripp Lite
            relationship: 'technology provider',
            date: '',
            details: {
                notes: 'Dominion Voting Systems provides election technology solutions, including voting machines and tabulators.'
            }
        },
        {
            source: 'node16', // United States Intelligence Community (IC)
            target: 'node11', // Palintir
            relationship: 'collaboration',
            date: '',
            details: {
                notes: 'The United States Intelligence Community collaborates with NATO on intelligence sharing and security operations.'
            }
        },
        {
            source: 'node16', // United States Intelligence Community (IC)
            target: 'node3', //NATO
            relationship: 'collaboration',
            date: '',
            details: {
                notes: 'The United States Intelligence Community collaborates with NATO on intelligence sharing and security operations.'
            }
        },
        {
            source: 'node17', // United States Department of Defense (DoD)
            target: 'node16', // United States Intelligence Community (IC)
            relationship: 'collaboration',
            date: '',
            details: {
                notes: ''
            }
        },
        {
            source: 'node17', // United States Department of Defense (DoD)
            target: 'node11', // United States Intelligence Community (IC)
            relationship: 'collaboration',
            date: '',
            details: {
                notes: ''
            }
        },
        {
            source: 'node17', // United States Department of Defense (DoD)
            target: 'node3', // United States Intelligence Community (IC)
            relationship: 'collaboration',
            date: '',
            details: {
                notes: ''
            }
        },
        {
            source: 'node14', // SpaceX
            target: 'node17', // United States Department of Defense (DoD)
            relationship: 'contractual relationship',
            date: '',
            details: {
                notes: 'SpaceX provides launch services to the DoD, including the launch of classified satellites and other payloads. SpaceX has about $22 billion in government contracts, with $15 billion derived from NASA.'
            }
        },
        {
            source: 'node1', // Elon Musk
            target: 'node18', // Tesla, Inc.
            relationship: 'founder and CEO',
            date: '',
            details: {
                notes: 'Elon Musk is the founder and CEO of Tesla, Inc., which focuses on electric vehicles and clean energy solutions.'
            }
        },
        {
            source: 'node6', // Eaton Corp.
            target: 'node18', // Tesla, Inc.
            relationship: 'partnership',
            date: 'September 2024',
            details: {
                notes: 'In September 2024, Eaton Corp. announced another partnership, this time with Trump’s single largest campaign contributor, Elon Musk (via Tesla), further dirtying the election waters, and providing a convenient cover for their correspondence and monetary connections.'
            }
        },
        {
            source: 'node8', // Tesla, Inc.
            target: 'node9', // Elon Musk
            relationship: 'private',
            date: '',
            details: {
                notes: 'They talk all of the time.'
            }
        },
        // add a node connecting thiel to america pac
        {
            source: 'node2', // Peter Thiel
            target: 'node13', // The America PAC
            relationship: 'support',
            date: '',
            details: {
                notes: 'Peter Thiel is co-founder of The America PAC, which was created by Elon Musk.'
            }
        }
    ]
};