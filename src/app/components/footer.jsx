import React from 'react'

const Footer = () => {
  return (
    <div>

<footer className="bg-white rounded-lg shadow-sm m-4 dark:bg-gray-800">
  <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
      © 2023{" "}
      <a className="hover:underline" href="https://flowbite.com/">
        
      </a>
      . All Rights Reserved.
    </span>
    <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
      <li>
        <a className="hover:underline me-4 md:me-6" href="#">
          About
        </a>
      </li>
      <li>
        <a className="hover:underline me-4 md:me-6" href="#">
          Privacy Policy
        </a>
      </li>
      <li>
        <a className="hover:underline me-4 md:me-6" href="#">
          Licensing
        </a>
      </li>
      <li>
        <a className="hover:underline" href="#">
          Contact
        </a>
      </li>
    </ul>
  </div>
</footer>;

    </div>
  )
}

export default Footer