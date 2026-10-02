export default function getShortName(name?: string) {
  if (!name) return

  const [firstName, lastName] = name.split(' ')

  if (!lastName) return firstName

  return `${firstName} ${lastName[0]}.`
}
