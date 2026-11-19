import { GithubIcon } from '@/components/icons'
import { Separator } from '@/components/ui/separator'

import XIcon from '@/assets/svg/x-icon'

const currentYear = new Date().getFullYear()

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' }
]

const socialItems = [
  { label: 'GitHub', href: 'https://github.com/anuzx/beru', icon: GithubIcon },
  { label: 'X', href: '#', icon: XIcon }
]

const Footer = () => {
  return (
    <footer>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8'>
        <div className='flex items-center gap-5 whitespace-nowrap'>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className='opacity-80 transition-opacity duration-300 hover:opacity-100'
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className='flex items-center gap-4'>
          {socialItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-label={item.label}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
              className='opacity-80 transition-opacity duration-300 hover:opacity-100'
            >
              <item.icon className='size-5' />
            </a>
          ))}
        </div>
      </div>

      <Separator />

      <div className='mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6'>
        <p className='text-center font-medium text-balance'>
          {`©${currentYear}`} Beru — with love by Anuj
        </p>
      </div>
    </footer>
  )
}

export default Footer