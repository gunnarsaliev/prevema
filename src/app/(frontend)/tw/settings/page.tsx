export default function () {
  return (
    <div>
      <h1>Settings</h1>
      <ul className="text-sky-800">
        <li className="mb-2 hover:underline ">
          <a href="/tw/settings/profile">Profile</a>
        </li>
        <li className="mb-2 hover:underline">
          <a href="/tw/settings/organization">Organization</a>
        </li>
        <li className="mb-2 hover:underline">
          <a href="/tw/settings/address">Address</a>
        </li>
        <li className="hover:underline">
          <a href="/tw/settings/preferences">Preferences</a>
        </li>
        <li className="hover:underline">
          <a href="/tw/settings/billing">Billing</a>
        </li>
      </ul>
    </div>
  )
}
