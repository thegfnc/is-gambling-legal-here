import Heading from '../components/Heading'
import { CMSCountry, CommonLegalStatus, MedicinalLegalStatus } from '../types'
import { sanityFetch } from '../data/client'

type TableRow = {
  country: string
  administrativeAreaLevel1?: string
  administrativeAreaLevel2?: string
  locality?: string
  medicinal: MedicinalLegalStatus | undefined
  recreational: CommonLegalStatus | undefined
  quantity: string | undefined
}

const flattenLegalityData = (legalityData: CMSCountry[]) => {
  const tableRows: TableRow[] = []

  legalityData.forEach(country => {
    tableRows.push({
      country: country.name,
      administrativeAreaLevel1: undefined,
      administrativeAreaLevel2: undefined,
      locality: undefined,
      medicinal: country.isWeedLegalHere?.medicinal?.legalStatus,
      recreational: country.isWeedLegalHere?.recreational?.legalStatus,
      quantity: country.isWeedLegalHere?.recreational?.quantity,
    })

    if (country.administrativeAreaLevel1?.children?.length) {
      country.administrativeAreaLevel1.children.forEach(
        administrativeAreaLevel1 => {
          tableRows.push({
            country: country.name,
            administrativeAreaLevel1: administrativeAreaLevel1.name,
            administrativeAreaLevel2: undefined,
            locality: undefined,
            medicinal:
              administrativeAreaLevel1.isWeedLegalHere?.medicinal?.legalStatus,
            recreational:
              administrativeAreaLevel1.isWeedLegalHere?.recreational
                ?.legalStatus,
            quantity:
              administrativeAreaLevel1.isWeedLegalHere?.recreational?.quantity,
          })

          if (
            administrativeAreaLevel1.administrativeAreaLevel2?.children?.length
          ) {
            administrativeAreaLevel1.administrativeAreaLevel2.children.forEach(
              administrativeAreaLevel2 => {
                tableRows.push({
                  country: country.name,
                  administrativeAreaLevel1: administrativeAreaLevel1.name,
                  administrativeAreaLevel2: administrativeAreaLevel2.name,
                  locality: undefined,
                  medicinal:
                    administrativeAreaLevel2.isWeedLegalHere?.medicinal
                      ?.legalStatus,
                  recreational:
                    administrativeAreaLevel2.isWeedLegalHere?.recreational
                      ?.legalStatus,
                  quantity:
                    administrativeAreaLevel2.isWeedLegalHere?.recreational
                      ?.quantity,
                })
              }
            )
          }

          if (administrativeAreaLevel1.locality?.children?.length) {
            administrativeAreaLevel1.locality.children.forEach(locality => {
              tableRows.push({
                country: country.name,
                administrativeAreaLevel1: administrativeAreaLevel1.name,
                administrativeAreaLevel2: undefined,
                locality: locality.name,
                medicinal: locality.isWeedLegalHere?.medicinal?.legalStatus,
                recreational:
                  locality.isWeedLegalHere?.recreational?.legalStatus,
                quantity: locality.isWeedLegalHere?.recreational?.quantity,
              })
            })
          }
        }
      )
    }
  })

  return tableRows
}

const getAdditionalCellStyles = (
  legalStatus: CommonLegalStatus | undefined
) => {
  switch (legalStatus) {
    case 'illegal':
      return ' bg-brand-red/90 text-black'
    case 'decriminalized':
      return ' bg-brand-yellow/90 text-black'
    case 'legal':
      return ' bg-brand-green/90 text-black'
    case 'unknown':
      return ' bg-gray-300/90 text-black'
    default:
      return ' bg-gray-500/90 text-black'
  }
}

const TH_CLASS_NAME =
  'px-6 py-6 text-s font-medium text-gray-500 uppercase tracking-wider'

const TD_CLASS_NAME = 'px-6 py-4 text-sm border-r-2 border-slate-700'

const ALL_DATA_QUERY = `
  *[_type == 'IIHD_country'] | order(name) {
    name,
    isWeedLegalHere,
    labels,
    administrativeAreaLevel1 {
      children[]-> {
        name,
        isWeedLegalHere,
        administrativeAreaLevel2 {
          children[]-> {
            name,
            isWeedLegalHere
          }
        },
        locality {
          children[]-> {
            name,
            isWeedLegalHere
          }
        }
      }
    }
  }
`

export default async function Admin() {
  const data = await sanityFetch<CMSCountry[]>({
    query: ALL_DATA_QUERY,
    tags: [
      'IIHD_country',
      'IIHD_administrativeAreaLevel1',
      'IIHD_administrativeAreaLevel2',
      'IIHD_locality',
    ],
  })

  const tableRows = flattenLegalityData(data)

  return (
    <div className='my-10 w-full'>
      <Heading text='Legality Data' />
      <div className='mt-10 w-full overflow-scroll bg-black p-4'>
        <table className='w-full min-w-[1200px] table-fixed border-collapse border-inherit text-center indent-0 text-gray-100'>
          <thead className='sticky top-0 bg-white align-top'>
            <tr>
              <th className={TH_CLASS_NAME + ' text-left'}>Country</th>
              <th className={TH_CLASS_NAME}>
                Administrative Area Level 1 <br />
                <span className='text-xs'>(US States)</span>
              </th>
              <th className={TH_CLASS_NAME}>
                Administrative Area Level 2 <br />
                <span className='text-xs'>(US Counties)</span>
              </th>
              <th className={TH_CLASS_NAME}>
                Locality <br />
                <span className='text-xs'>(US Cities)</span>
              </th>
              <th className={TH_CLASS_NAME}>Medicinal</th>
              <th className={TH_CLASS_NAME}>Recreational</th>
              <th className={TH_CLASS_NAME}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(
              (
                {
                  country,
                  administrativeAreaLevel1,
                  administrativeAreaLevel2,
                  locality,
                  medicinal,
                  recreational,
                  quantity,
                },
                index
              ) => (
                <tr
                  key={
                    country +
                    administrativeAreaLevel1 +
                    administrativeAreaLevel2 +
                    locality
                  }
                  className={`border-b-2 border-slate-600 hover:bg-slate-600 ${
                    index % 2 === 1 ? 'bg-slate-800' : 'bg-transparent'
                  }`}
                >
                  <td
                    className={
                      TD_CLASS_NAME + ' border-l-2 border-slate-700 text-left'
                    }
                  >
                    {country}
                  </td>
                  <td className={TD_CLASS_NAME}>{administrativeAreaLevel1}</td>
                  <td className={TD_CLASS_NAME}>{administrativeAreaLevel2}</td>
                  <td className={TD_CLASS_NAME}>{locality}</td>
                  <td
                    className={
                      TD_CLASS_NAME + getAdditionalCellStyles(medicinal)
                    }
                  >
                    {medicinal}
                  </td>
                  <td
                    className={
                      TD_CLASS_NAME + getAdditionalCellStyles(recreational)
                    }
                  >
                    {recreational}
                  </td>
                  <td className={TD_CLASS_NAME}>{quantity}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
