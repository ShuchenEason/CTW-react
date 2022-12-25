import { useRef, useState } from 'react';
import {
    ProCard,
    ProForm,

    ProFormList,
    ProFormDigit,
    ProFormSelect,
    StepsForm,
} from '@ant-design/pro-components';
import type { FormListActionType } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import data from './data.json'

type DataSourceType = {
    id: React.Key;
    dish?: string;
    number?: number;
};

export default () => {

    const [meal, setMeal] = useState<string>('')
    const [peopleCount, setCount] = useState<number>(0)
    const [restaurant, setRest] = useState<string>('')
    const [dishes, setDishes] = useState<readonly DataSourceType[]>([])

    const allData = data.dishes
    const restaurantAvailable: { value: string, label: React.ReactNode }[] = []
    const [rA, setRa] = useState<{ value: string, label: React.ReactNode }[]>([])
    const dishAvailable: { value: string, label: React.ReactNode, disabled: boolean }[] = []
    const temp: string[] = []
    let choosed: string[] = []
    const dishData: any[] = []

    const actionRef = useRef<FormListActionType<{ name: string; }>>()

    return (
        <ProCard>
            <StepsForm<{
                name: string;
            }>
                onFinish={async (values) => {
                    console.log(values)
                    message.success('Successfully submited')
                    return
                }}
                formProps={{
                    validateMessages: {
                        required: 'This field is required',
                    },
                }}
                submitter={{
                    render: (props) => {
                        if (props.step === 0) {
                            return (
                                <Button type="primary" onClick={() => props.onSubmit?.()}>
                                    Next
                                </Button>
                            );
                        }

                        if (props.step === 1) {
                            return [
                                <Button key="preToZero" onClick={() => {
                                    props.form?.resetFields()
                                    props.onPre?.()
                                }}>
                                    Previous
                                </Button>,
                                <Button type="primary" key="goToTwo" onClick={() => props.onSubmit?.()}>
                                    Next
                                </Button>,
                            ];
                        }

                        if (props.step === 2) {
                            return [
                                <Button key="preToOne" onClick={() => {
                                    props.form?.resetFields()
                                    actionRef.current?.remove([1, 2, 3, 4, 5, 6, 7, 8, 9])
                                    props.onPre?.()
                                }}>
                                    Previous
                                </Button>,
                                <Button type="primary" key="goToThree" onClick={() => props.onSubmit?.()}>
                                    Next
                                </Button>,
                            ];
                        }

                        return [
                            <Button key="preToTwo" onClick={() => {
                                props.form?.resetFields()
                                props.onPre?.()
                            }}>
                                Previous
                            </Button>,
                            <Button type="primary" key="goReview" onClick={() => props.onSubmit?.()}>
                                Submit
                            </Button>,
                        ];
                    },
                }}
            >
                <StepsForm.StepForm<{
                    meal: string;
                    peoplecount: number;
                }>
                    name="step1"
                    title="Step1"
                    onFinish={async (value) => {

                        const mealNew = value.meal
                        const countNew = value.peoplecount
                        setMeal(mealNew)
                        setCount(countNew)

                        /* Generate available restaurants for step2 options */
                        const temp: string[] = []
                        allData.map((el: any) => {
                            if (el.availableMeals.indexOf(mealNew) !== -1 && temp.indexOf(el.restaurant) === -1) {
                                temp.push(el.restaurant)
                                restaurantAvailable.push({ value: el.restaurant, label: el.restaurant })
                            }
                        })
                        setRa(restaurantAvailable)

                        return true
                    }}
                >
                    <ProFormSelect
                        label="Please Select a Meal"
                        placeholder="Please choose"
                        name="meal"
                        width="md"
                        rules={[{ required: true, },]}
                        options={[
                            {
                                value: 'breakfast',
                                label: 'Breakfast',
                            },
                            {
                                value: 'lunch',
                                label: 'Lunch'
                            },
                            {
                                value: 'dinner',
                                label: 'Dinner',
                            },
                        ]}
                    />
                    <ProFormDigit
                        name="peoplecount"
                        label="Please Enter Number of People"
                        placeholder="Please enter"
                        width="md"
                        max={10}
                        min={1}
                        rules={[{ required: true }]}
                    />
                </StepsForm.StepForm>
                <StepsForm.StepForm<{
                    restaurant: string;
                }>
                    name="step2"
                    title="Step2"
                    onFinish={async (value) => {
                        const restNew = value.restaurant
                        setRest(restNew)
                        return true
                    }}
                >
                    <ProFormSelect
                        label="Please Select a Restaurant"
                        placeholder="Please choose"
                        name="restaurant"
                        width="md"
                        rules={[{ required: true }]}
                        fieldProps={{ options: rA }}
                    />
                </StepsForm.StepForm>
                <StepsForm.StepForm<{
                    dishes: DataSourceType[];
                }>
                    name="step3"
                    title="Step3"
                    onFinish={async (value) => {
                        const dishes = value.dishes
                        setDishes(dishes)
                        return true
                    }}

                >
                    <ProFormList
                        actionRef={actionRef}
                        actionGuard={{
                            beforeAddRow: async (defaultValue, insertIndex, count) => {
                                const last: any = actionRef.current?.get(insertIndex as number - 1)
                                if (last.dish) {
                                    return Promise.resolve(true)
                                } else {
                                    return false
                                }
                            }
                        }}
                        name="dishes"
                        label="Ordering Dishes"
                        copyIconProps={false}
                        creatorButtonProps={{
                            creatorButtonText: 'Add new dishes',
                        }}
                        deleteIconProps={{
                            tooltipText: 'Cancel this order',
                        }}
                        rules={[
                            {
                                validator: async (_, value) => {
                                    /* Dishes number validation */
                                    let temp: number = 0
                                    value.map((v: any) => {
                                        if (v.dish) {
                                            temp += Number(v.number)
                                        } else {
                                            throw new Error('Please choose a dish')
                                        }
                                    })
                                    if (temp < peopleCount) {
                                        throw new Error('The total number of dishes is not enough!')
                                    } else if (temp > 10) {
                                        throw new Error('The total number of dishes is too much!(A maximum of 10 is allowed)')
                                    }
                                    else {
                                        return Promise.resolve
                                    }
                                }
                            },
                        ]}
                        initialValue={[{ number: '1' }]}
                    >
                        {(f, index, action) => {

                            /* Get the choosed dish and block */
                            dishData.push(action.getCurrentRowData())
                            choosed = dishData.map((v) => {
                                return v.dish
                            })

                            /* Generate available dishes due to step1 and step2 choice */
                            allData.map((el: any) => {
                                if (el.availableMeals.indexOf(meal) !== -1 && el.restaurant === restaurant && temp.indexOf(el.name) === -1) {
                                    temp.push(el.name)
                                    dishAvailable.push({ value: el.name, label: el.name, disabled: false })
                                }
                                if (temp.indexOf(el.name) !== -1 && choosed.indexOf(el.name) !== -1) {
                                    dishAvailable.map((value, index) => {
                                        if (value.value === el.name) {
                                            value.disabled = true
                                        }
                                    })
                                }

                            })
                            return (
                                <ProForm.Group>
                                    <ProFormSelect
                                        name="dish"
                                        label="Please Select a Dish"
                                        placeholder="Please select"
                                        width='sm'
                                        required
                                        fieldProps={{ options: dishAvailable }}
                                    />
                                    <ProFormDigit
                                        name="number"
                                        label="Please Enter Number of Servings"
                                        placeholder="Please enter"
                                        width='sm'
                                        initialValue='1'
                                        max={10}
                                        min={1}
                                        required
                                    />
                                </ProForm.Group>
                            )
                        }}
                    </ProFormList>

                </StepsForm.StepForm>

                <StepsForm.StepForm name="review" title="Review">
                    <ProCard
                        title="Review your orders please"
                        bordered
                        headerBordered
                    >
                        <ProCard title="Ordering Info" colSpan="40%">
                            <div style={{ height: 60 }}>Meal</div>
                            <div style={{ height: 60 }}>No. of People</div>
                            <div style={{ height: 60 }}>Restaurant</div>
                            <div style={{ height: 60 }}>Dishes</div>
                        </ProCard>
                        <ProCard title="Details" colSpan="60%">
                            <div style={{ height: 60 }}>{meal}</div>
                            <div style={{ height: 60 }}>{peopleCount}</div>
                            <div style={{ height: 60 }}>{restaurant}</div>
                            <div >
                                <ProCard bordered>
                                    <ProCard title="Dish" colSpan="50%">
                                        {dishes?.map((dish) => {
                                            if (dish.number !== 0) {
                                                return (
                                                    <div style={{ height: 60 }}>{dish.dish}</div>
                                                )
                                            }
                                        })}
                                    </ProCard>
                                    <ProCard title="Number">
                                        {dishes?.map((dish) => {
                                            if (dish.number !== 0) {
                                                return (
                                                    <div style={{ height: 60 }}>{dish.number}</div>
                                                )
                                            }
                                        })}
                                    </ProCard>
                                </ProCard>
                            </div>
                        </ProCard>
                    </ProCard>
                </StepsForm.StepForm>
            </StepsForm>
        </ProCard>
    );
};